import { logout } from "../redux/slices/authSlice";

/**
 * Thunk-style logout helper.
 *
 * Usage in a component:
 *   import { handleLogout } from "../utils/logout";
 *   ...
 *   dispatch(handleLogout(dispatch));
 *
 * Or with the hook below:
 *   const logout = useLogout();
 *   logout();
 */
export const handleLogout = (dispatch) => {
  // 1. Clear Redux state + localStorage (done inside the authSlice reducer)
  dispatch(logout());
  // 2. Redirect to login
  window.location.href = "/log-in";
};

/**
 * Convenience React hook — call inside any component.
 *
 * const logout = useLogout();
 * <button onClick={logout}>Sign out</button>
 */
import { useDispatch } from "react-redux";
export const useLogout = () => {
  const dispatch = useDispatch();
  return () => handleLogout(dispatch);
};