const dropZone=document.querySelector(".drop-zone");
const browseBtn=document.querySelector(".browseBtn");
const fileInput=document.querySelector(".fileInput")
const baseURL = "https://file-share123.herokuapp.com";
const uploadURL = `${baseURL}/api/files`;
const emailURL = `${baseURL}/api/files/send`;
const uploader=document.querySelector(".uploader")
const progressBar= document.querySelector(".uploader .progress")
const percentText= document.querySelector("p.percent");
const progressionBar= document.querySelector(" .progression")
const inputContainer=document.querySelector(".input-container")
const fileURL=document.querySelector(".fileURL")
const copyIcon=document.querySelector(".copy-icon")
const emailBox=document.querySelector(".email-box")
const emailForm=document.querySelector(".email-form")
const toast=document.querySelector(".toast")
let copyIcon2
let fileURL2
const maxAllowedSize=100 * 1024 * 1024
let linkArray=[];
dropZone.addEventListener("dragover",(e)=>{
  e.preventDefault();
  console.log("dragged");
  if(!dropZone.classList.contains("dragged"))
  {
    dropZone.classList.add("dragged");
  }
})

dropZone.addEventListener("dragleave",()=>{
  dropZone.classList.remove("dragged")
})
dropZone.addEventListener("drop",(e)=>{
    e.preventDefault();
    const files=e.dataTransfer.files;
    if(files.length>0)
    {
      fileInput.files=files;
      display("none");
      uploadFile();
    }
  dropZone.classList.remove("dragged")
})

fileInput.addEventListener("change", () => {
  if (fileInput.files[0].size > maxAllowedSize) {
    showToast("Max file size is 100MB");
    fileInput.value = ""; // reset the input
    return;
  }
  uploadFile();
})
browseBtn.addEventListener("click",()=>{
  fileInput.click();
  display("none")
})

const uploadFile = () => {
  console.log("file added uploading");
  files = fileInput.files;
  console.log(files[0]);
  let link;
  const formData = new FormData();
  formData.append("myfile", files[0]);

  uploader.style.display="block";
  
  // upload file
  const xhr = new XMLHttpRequest();

  // listen for upload progress
  xhr.upload.onprogress = function (event) {
    // find the percentage of uploaded
    let percent = Math.round((100 * event.loaded) / event.total);
    console.log(percent);
    progressBar.style.width=percent+"%";
    percentText.innerText=percent+"%";
    progressionBar.style.width=percent+"%";
  };
  // handle error
  xhr.upload.onerror = function () {
    showToast(`Error in upload: ${xhr.status}.`);
    fileInput.value = ""; // reset the input
  };

  // listen for response which will give the link
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      console.log(xhr.responseText)
      link={
        name:files[0].name,
        url:xhr.responseText
      }
      linkArray.push(link);
      localStorage.setItem("links", JSON.stringify(linkArray))
      fetchLinks()
      onFileUpload(xhr.responseText)
    }
  };

  xhr.open("POST", uploadURL);
  xhr.send(formData);
};

copyIcon.addEventListener("click",()=>{
  fileURL.select();
  document.execCommand("copy");
  showToast("Copied")
})

const onFileUpload=(res)=>{
  fileInput.value = ""; 

  emailForm[2].removeAttribute("disabled");
  emailForm[2].innerText = "Send";

  uploader.style.display="none"
  display("block")
  fileURL.value=JSON.parse(res).file;
}

emailForm.addEventListener("submit",(e)=>{
  e.preventDefault();
  // console.log(emailForm[2])
  emailForm[2].setAttribute("disabled","true")
  emailForm[2].innerText="Sending.."
  const url=fileURL.value
  console.log(emailForm.elements["email-to"].value)
  const formData={
    uuid:url.split("/").splice(-1,1)[0],
    sender:emailForm.elements["email-from"].value,
    reciever:emailForm.elements["email-to"].value
  }
 console.log(formData)
fetch(emailURL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(formData),
})
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      display("none")
      showToast("Email Sent"); 
    }
  })
})

let toastTimer;
// the toast function
const showToast = (msg) => {
  clearTimeout(toastTimer);
  toast.innerText = msg;
  toast.classList.add("show");
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
};

function display(x){
  inputContainer.style.display=x
  emailBox.style.display=x
  document.querySelector("p.copy").style.display=x
  document.querySelector("p.or").style.display=x
}
////////////////////////////LINK GENERATOR////////////////////////////////////////////////////
function fetchLinks() {
  if (localStorage.getItem("links")) {
    linkArray = JSON.parse(localStorage.getItem("links"))
  }
   else {
    let link = {
      name: "Example File",
      url: "https://example.com"
    }
    linkArray.push(link)
    localStorage.setItem("links", JSON.stringify(linkArray))
  }
  buildLinks();
}
fetchLinks();
function buildLinks() {
  const container=document.querySelector(".links");
  container.textContent="";
  console.log(linkArray)
  linkArray.forEach((link) => {
    const {
      name,
      url
    } = link;
    const nameNew=name.split(".");
    const ul = document.createElement('ul');
    const firstLi=document.createElement('li');
    firstLi.textContent=nameNew[0].slice(0,7)+"."+nameNew[1];
    const secondLi=document.createElement('li');
    secondLi.classList.add("input-container2");
    const inputBox=document.createElement("input");
    inputBox.classList.add("fileURL2");
    inputBox.setAttribute('type',"text");
    inputBox.setAttribute('value',`${JSON.parse(url).file}`);
    // inputBox.setAttribute('value',`${url}`);
    inputBox.readOnly=true;
    const icon=document.createElement('i');
    icon.classList.add("fas","fa-copy","copy-icon2");
    const button=document.createElement("button");
    button.classList.add("delete-button");
    button.textContent="DELETE";
    button.setAttribute('onclick', `deleteLink('${url}')`);
    secondLi.append(inputBox,icon);
    ul.append(firstLi,secondLi,button);
    container.append(ul)
  });
  copyIcon2=document.querySelectorAll(".copy-icon2");
  fileURL2=document.querySelectorAll(".fileURL2");
  console.log(copyIcon2)
  for(let i=0;i<copyIcon2.length;i++){
    copyIcon2[i].addEventListener("click",()=>{
      fileURL2[i].select();
      document.execCommand("copy");
      showToast("Copied")
    })
  }
}
function deleteLink(url) {
  linkArray.forEach((link, i) => {
    if (link.url === url) {
      linkArray.splice(i, 1);
    }
  });
  localStorage.setItem('links', JSON.stringify(linkArray));
  fetchLinks();
}

// ////////////////////////////////////////////////theme toggler//////////////////////////////////////////////////
const toggle=document.querySelector("input[type=checkbox]")
const image=document.querySelector("main-img")
console.log(toggle);
toggle.addEventListener("change",changetheme);
function changetheme(event){
  console.log(event.target.checked);
  if(event.target.checked)
  {document.documentElement.setAttribute("data-theme","dark");
    darkmode();
    localStorage.setItem("theme","dark")
  }
  else
  {document.documentElement.setAttribute("data-theme","light");
  lightmode();
  localStorage.setItem("theme","light");
}

}
function darkmode(){
  document.querySelector("#toggle-icon .toggle-text").textContent="Dark Mode";
  document.querySelector("#toggle-icon i").classList.replace("fa-sun","fa-moon");
  image.src="dark.svg";
}
function lightmode(){
  document.querySelector("#toggle-icon .toggle-text").textContent="Light Mode";
  document.querySelector("#toggle-icon i").classList.replace("fa-moon","fa-sun");
  image.src="light.svg";
}
///////////////////////////////////////////////////////////Section Changer in Navbar////////////////////////////////////////////////////////////////
const home=document.querySelector("section.home")
const link=document.querySelector("section.link")
const usage = document.querySelector("section.usage")
const contact =document.querySelector("section.contact")
const linkButton=document.querySelector("a.l")
const homeButton=document.querySelector("a.h")
const usageButton=document.querySelector("a.u")
const contactButton=document.querySelector("a.c")
linkButton.addEventListener("click",()=>{
  home.style.display="none"
  usage.style.display="none"
  link.style.display="block"
  contact.style.display="none"
})
homeButton.addEventListener("click",()=>{
  usage.style.display="none"
  link.style.display="none"
  home.style.display="flex"
  contact.style.display="none"
})
usageButton.addEventListener("click",()=>{
  usage.style.display="block"
  link.style.display="none"
  home.style.display="none"
  contact.style.display="none"
})
contactButton.addEventListener("click",()=>{
  usage.style.display="none"
  link.style.display="none"
  home.style.display="none"
  contact.style.display="flex"
})