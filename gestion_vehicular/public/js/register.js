document.getElementById("file").onchange = (e) => {
  let reader = new FileReader();
  reader.readAsDataURL(e.target.files[0]);
  reader.onload = () => {
    let defaultImg = document.getElementById("default-image");
    let preview = document.getElementById("preview");
    defaultImg.style.display = "none";
    preview.style.display = "block";
    preview.src = reader.result;
  };
};

console.log(preview)