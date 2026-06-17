import { login } from "@/lib/actions/auth.actions";

async function testAction() {
  const formData = new FormData();
  formData.append("email", "admin1@sinergilaut.id");
  formData.append("password", "Password@2026");
  
  try {
    const res = await login(formData);
    console.log("Result:", res);
  } catch (e) {
    console.error("Error:", e);
  }
}
testAction();
