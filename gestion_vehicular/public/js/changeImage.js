document.getElementById("file").onchange = (e) => {
  let reader = new FileReader();
  reader.readAsDataURL(e.target.files[0]);
  reader.onload = () => {
    let profileImage = document.getElementById("preview");
    profileImage.src = reader.result;
  };
};
