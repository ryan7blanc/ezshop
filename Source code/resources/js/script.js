
function openModal()
{
    
    let product = document.getElementById(`popUp`);
    let data = document.getElementById('formID');
    let formdata = new FormData(data);



   
    let xhr = new XMLHttpRequest();
    console.warn(xhr.responseText);


    console.log(formdata);
    //product.classList.add('invisible');
    
        

    if(product.classList.contains('invisible'))
    {
        product.classList.remove('invisible');
        product.classList.add('visible');

        //let title = document.getElementById(`ti_0`);

    } else {
        product.classList.remove('visible');
        product.classList.add('invisible');
    }

    
    xhr.open("POST","/display", true);
    //xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
    
    xhr.send(formdata);

    //document.getElementById("titleID").innerHTML = xhr.responseText[0];
    //console.log(xhr.responseText[0]); 
    

}
/*
const dialog = document.querySelector("dialog");
const showButton = document.querySelector("dialog + button");
const closeButton = document.querySelector("dialog button");

// "Show the dialog" button opens the dialog modally
showButton.addEventListener("click", () => {
  dialog.showModal();
});

// "Close" button closes the dialog
closeButton.addEventListener("click", () => {
  dialog.close();
});
*/