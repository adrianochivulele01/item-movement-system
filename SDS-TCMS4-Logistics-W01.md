# System Design Specification (SDS)
## Module: TCMS4 - Logistics (Code 04)

### 1. Role Definitions
The module enforces a hierarchical level-based access system:
* **Level 1 (Viewer):** Read-only access to items and stock movements.
* **Level 2 (Operator):** Can add new items and record stock movements.
* **Level 3 (Manager):** Operator privileges + ability to edit/correct existing movements.
* **Level 4 (Administrator):** Manager privileges + access to assign, change, or revoke roles for other accounts.

### 2. Database Tables
* **`Tbl04Role`**: Stores the available roles and their hierarchical level numbers.
* **`Tbl04UserRole`**: Maps a Supabase Auth `user_id` to a specific `role_id`. Enforces one role per account.
* **`Tbl04RoleLog`**: An audit trail tracking who granted, changed, or revoked roles, the target user, and the timestamp.

### 3. Functions (RPCs)
* **`get_my_role()`**: Returns the current user's role and level. Used by the UI to adjust visibility.
* **`assign_role(email, role_code)`**: (Level 4+) Grants or changes a role for a user and logs the action.
* **`revoke_role(email)`**: (Level 4+) Removes a user's role (ensuring the last admin cannot be removed) and logs the action.
* **`list_accounts_with_roles()`**: (Level 4+) Feeds the admin management panel.
* **`list_history()`**: (Level 4+) Feeds the role assignment history table.
* **`add_item()`, `add_movement()`**: Write operations explicitly restricted to Level 2+ via internal security checks.
* **`update_movement()`**: Modification operation explicitly restricted to Level 3+.

### 4. Test Results (Negative & Positive Testing)
* **No Role / Unassigned:** Account successfully authenticates but receives a "No access to Logistics" message. The dashboard remains completely hidden.
* **Operator (Level 2):** Can view tables and add items/movements. The "Edit" buttons and the "Access Management" admin panel remain hidden.
* **Administrator (Level 4):** Full access. Successfully assigned roles to other users and revoked them. All actions were accurately recorded in the `Tbl04RoleLog` history table.