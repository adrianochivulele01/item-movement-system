-- 1. Enable RLS on both tables
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing open policies so direct table access is restricted
DROP POLICY IF EXISTS "Enable read access for all users" ON public.items;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.items;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.stock_movements;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.stock_movements;

-- 3. Stored RPC Functions
CREATE OR REPLACE FUNCTION public.add_item(p_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  INSERT INTO public.items (name)
  VALUES (p_name)
  RETURNING to_json(items.*) INTO v_result;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_item(p_id bigint, p_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  UPDATE public.items
  SET name = p_name
  WHERE id = p_id
  RETURNING to_json(items.*) INTO v_result;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_items()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT coalesce(json_agg(t), '[]'::json)
  FROM (
    SELECT id, name, created_at
    FROM public.items
    ORDER BY id ASC
  ) t;
$$;

CREATE OR REPLACE FUNCTION public.add_movement(p_item_id bigint, p_movement_type text, p_quantity int)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than zero.';
  END IF;

  INSERT INTO public.stock_movements (item_id, movement_type, quantity)
  VALUES (p_item_id, p_movement_type, p_quantity)
  RETURNING to_json(stock_movements.*) INTO v_result;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_movement(p_id bigint, p_item_id bigint, p_movement_type text, p_quantity int)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than zero.';
  END IF;

  UPDATE public.stock_movements
  SET item_id = p_item_id,
      movement_type = p_movement_type,
      quantity = p_quantity
  WHERE id = p_id
  RETURNING to_json(stock_movements.*) INTO v_result;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_movements(p_item_id bigint DEFAULT NULL)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT coalesce(json_agg(t), '[]'::json)
  FROM (
    SELECT m.id, m.item_id, i.name AS item_name, m.movement_type, m.quantity, m.movement_date
    FROM public.stock_movements m
    JOIN public.items i ON i.id = m.item_id
    WHERE (p_item_id IS NULL OR m.item_id = p_item_id)
    ORDER BY m.movement_date DESC, m.id DESC
  ) t;
$$;

CREATE OR REPLACE FUNCTION public.get_stock()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT coalesce(json_agg(t), '[]'::json)
  FROM (
    SELECT 
      i.id,
      i.name,
      coalesce(SUM(CASE WHEN m.movement_type = 'IN' THEN m.quantity ELSE -m.quantity END), 0) AS current_stock
    FROM public.items i
    LEFT JOIN public.stock_movements m ON i.id = m.item_id
    GROUP BY i.id, i.name
    ORDER BY i.id ASC
  ) t;
$$;

-- 4. Grant Anon Access to Functions
GRANT EXECUTE ON FUNCTION public.add_item(text) TO anon;
GRANT EXECUTE ON FUNCTION public.update_item(bigint, text) TO anon;
GRANT EXECUTE ON FUNCTION public.list_items() TO anon;
GRANT EXECUTE ON FUNCTION public.add_movement(bigint, text, int) TO anon;
GRANT EXECUTE ON FUNCTION public.update_movement(bigint, bigint, text, int) TO anon;
GRANT EXECUTE ON FUNCTION public.list_movements(bigint) TO anon;
GRANT EXECUTE ON FUNCTION public.get_stock() TO anon;