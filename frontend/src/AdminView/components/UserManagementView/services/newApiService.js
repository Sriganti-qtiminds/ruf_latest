import { getRecords, updateUserRecordApi } from "../apiRoute";

export const fetchUsersAndRoles = async () => {
  try {
    const users = await getRecords(
      "dy_user",
      "id,user_name,mobile_no,role_id,rstatus"
    );
    const roles = await getRecords("st_role", "id,role");
    return { users: users.result, roles: roles.result };
  } catch (error) {
    console.error("Error fetching users and roles:", error);
    return { error: error.message };
  }
};

export const updateUserRecord = async (userId, roleId, rstatus) => {
  try {
    const response = await updateUserRecordApi(userId, roleId, rstatus);
    return { success: true, data: response };
  } catch (error) {
    console.error("Error updating user record:", error);
    return { error: error.message };
  }
};
