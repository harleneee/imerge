const fileInput = document.getElementById("pdfs")
const fileList = document.getElementById("fileList")
const dropZone = document.getElementById("dropZone")
const mergeBtn = document.getElementById("mergeBtn")

let filesArray = []


fileInput.addEventListener("change",(e)=>{

addFiles([...e.target.files])

})


dropZone.addEventListener("dragover",(e)=>{

e.preventDefault()
dropZone.classList.add("dragover")

})


dropZone.addEventListener("dragleave",()=>{

dropZone.classList.remove("dragover")

})


dropZone.addEventListener("drop",(e)=>{

e.preventDefault()

dropZone.classList.remove("dragover")

addFiles([...e.dataTransfer.files])

})


function addFiles(files){

files.forEach(file=>{

if(file.type==="application/pdf"){

filesArray.push(file)

}

})

renderList()

}


function renderList(){

fileList.innerHTML=""

filesArray.forEach((file,index)=>{

const li=document.createElement("li")

li.draggable=true

li.innerHTML=`

<div class="file-info">

<strong>${file.name}</strong>

<small>${(file.size/1024/1024).toFixed(2)} MB</small>

</div>

<button class="remove-btn">X</button>

`

li.querySelector(".remove-btn").onclick=()=>{

filesArray.splice(index,1)

renderList()

}

li.addEventListener("dragstart",()=>{

li.classList.add("dragging")

})

li.addEventListener("dragend",()=>{

li.classList.remove("dragging")

})

li.addEventListener("dragover",(e)=>{

e.preventDefault()

const dragging=document.querySelector(".dragging")

const nodes=[...fileList.children]

const currentIndex=nodes.indexOf(li)

const dragIndex=nodes.indexOf(dragging)

if(currentIndex!==dragIndex){

filesArray.splice(currentIndex,0,filesArray.splice(dragIndex,1)[0])

renderList()

}

})

fileList.appendChild(li)

})

}


mergeBtn.addEventListener("click",mergePDFs)


async function mergePDFs(){

if(!filesArray.length){

alert("Upload PDF files first")

return

}

document.getElementById("progressContainer").classList.remove("hidden")

const mergedPdf=await PDFLib.PDFDocument.create()

for(const file of filesArray){

const bytes=await file.arrayBuffer()

const pdf=await PDFLib.PDFDocument.load(bytes)

const pages=await mergedPdf.copyPages(pdf,pdf.getPageIndices())

pages.forEach(p=>mergedPdf.addPage(p))

}

const mergedBytes=await mergedPdf.save()

const blob=new Blob([mergedBytes],{type:"application/pdf"})

const url=URL.createObjectURL(blob)

let name=document.getElementById("filename").value

if(!name) name="merged"

const a=document.createElement("a")

a.href=url
a.download=name+".pdf"
a.click()

URL.revokeObjectURL(url)

document.getElementById("progressContainer").classList.add("hidden")

document.getElementById("successModal").classList.remove("hidden")

}


function resetApp(){

filesArray=[]

fileInput.value=""

fileList.innerHTML=""

document.getElementById("filename").value=""

document.getElementById("successModal").classList.add("hidden")

}