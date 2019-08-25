var token = null;

async function getUser(access_token) {
  const url = `https://graph.facebook.com/v3.3/me?access_token=${access_token}`;
  const result = await fetch(url);
  let jsonResult = await result.json();
  return jsonResult;
}
document.querySelector("#submit_token").addEventListener("click", async () => {
  token = document.getElementById("your_token").value;
  if (!token || !token.length) {
    alert("Vui lòng nhập token");
  } else {
    const user = await getUser(token);
    if (user) {
      document.getElementById("function_form").style.display = "block";
      document.getElementById("login_form").style.display = "none";
      document.querySelector("#function_form #user_name").innerText = user.name;
    }
  }
});
