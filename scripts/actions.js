var token = null;
var friend_total = 0

async function getUser(access_token) {
  const url = `https://graph.facebook.com/v3.3/me?access_token=${access_token}`;
  const result = await fetch(url);
  let jsonResult = await result.json();
  return jsonResult;
}
async function getFriendsTototal(access_token) {
  const url = `https://graph.facebook.com/v4.0/me/friends?access_token=${access_token}`;
  const result = await fetch(url);
  let jsonResult = await result.json();
  return jsonResult.summary.total_count;
}

async function getFriends(access_token, nextapi) {
  if(!nextapi || !nextapi.length)
    return []
  let url = `https://graph.facebook.com/v4.0/me/friends?access_token=${access_token}&fields=id,name&limit=200`
  if(nextapi != 'url')
    url= nextapi
  const result = await fetch(url);
  let jsonResult = await result.json();
  return [...jsonResult.data, ...await getFriends(access_token, jsonResult.paging.next)];
}
async function getImagesByUid(access_token, uid, nextapi) {
  if(!nextapi || !nextapi.length)
    return []
  let url = `https://graph.facebook.com/v4.0/${uid}/photos?access_token=${access_token}&fields=images&limit=200`
  if(nextapi != 'url')
    url= nextapi
  const result = await fetch(url);
  let jsonResult = await result.json();

  const image_list = jsonResult.data.map(item=> item.images[0].source)
  return [...image_list, ...await getImagesByUid(access_token,uid,jsonResult && jsonResult.paging && jsonResult.paging.next ? jsonResult.paging.next: '')];
}


async function getImages(access_token, listuid, index) {
  if(index >= listuid.length)
    return []
  const uid = listuid[index]
  document.getElementById("process_status").innerText=`Đang xử lý ${index+1}/${listuid.length}`
  const temp= {
    id: listuid[index].id,
    name:  listuid[index].name,
    images: await getImagesByUid(access_token, listuid[index].id, 'url')
  }
  return [ temp, ...await getImages(access_token, listuid, index + 1)];
}

function download(filename, text, typeFile) {
  const data = new Blob([text], {type: typeFile});
  var textFile = 'text'
  window.URL.revokeObjectURL(textFile);
  textFile = window.URL.createObjectURL(data);
  var element = document.createElement('a');
  element.setAttribute('href', textFile);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function createHtmlContent(urlfile){
  return content=`
    <html>
        <head>
        
        </head>
        <body>
            <div>
             <label for="input-file">Specify a file:</label><br>
             <input type="file" id="input-file">
            </div>
            <div id="image_list"></div>
            <textarea id="content-target"></textarea>
        </body>
        <script>
         document.getElementById('input-file').addEventListener('change', getFile)
          function getFile(event) {
            const input = event.target
            if ('files' in input && input.files.length > 0) {
              placeFileContent(document.getElementById('content-target'),input.files[0])
            }
          }

          function placeFileContent(target, file) {
          readFileContent(file).then(content => {
                target.value = content
                const data = JSON.parse(content)
                const image_div = document.getElementById("image_list");
                data.forEach(item=>{
                    item.images.forEach(item2=>{
                        var elem = document.createElement('img');
                        elem.src = item2
                        elem.width = 200
                        elem.height = 200
                        image_div.appendChild(elem)
                    })
                })
            }).catch(error => console.log(error))
          }

          function readFileContent(file) {
            const reader = new FileReader()
            return new Promise((resolve, reject) => {
              reader.onload = event => resolve(event.target.result)
              reader.onerror = error => reject(error)
              reader.readAsText(file)
            })
          }
        </script>
    <html>
  `
}
document.querySelector("#submit_token").addEventListener("click", async () => {
  token = document.getElementById("your_token").value;
  if (!token || !token.length) {
    alert("Vui lòng nhập token");
  } else {
    const user = await getUser(token);
    friend_total = await getFriendsTototal(token)
    if (user) {
      document.getElementById("function_form").style.display = "block";
      document.getElementById("login_form").style.display = "none";
      document.querySelector("#function_form #user_name").innerText = user.name;
      document.querySelector("#function_form #friends_totals").innerText = `Tổng số bạn ${friend_total} người`;
      document.querySelector("#function_form #backup_status").innerText = `Không tìm thấy bản sao lưu`;
    }
  }
});

document.querySelector("#btn_create_new_backup").addEventListener("click", async () => {
  const fileUrl = 'C:/Users/tvlin/Desktop/Facebook_Images_Backup/scripts/data_13.txt' // provide file location

  fetch(fileUrl)
      .then( r => r.text() )
      .then( t => console.log(t) )
  const friends_lists = await getFriends(token, 'url')
  console.log("Danh sách bạn", friends_lists.length)
  const array = friends_lists.slice(0, 2)
  const temp = await getImages(token, array, 0)
  download("dữ liệu 12314", JSON.stringify(temp),'application/json')
  // download("dữ liệu", createHtmlContent(),'text/html')
  document.querySelector("#function_form #friends_totals_real").innerText = `Tổng số bạn thực tế ${friends_lists.length} người`
})
document.querySelector("#btn_open_backup").addEventListener("click", async () => {

})


