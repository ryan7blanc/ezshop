let count = 0; 

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
    
    xhr.send(formdata);

    

}

function addCart(value)
{

    let xhr = new XMLHttpRequest();
    xhr.open("POST","/addcart", true);
    xhr.send();


    if(value == "add")
    {
        count = count + 1; 
    } else if (value == "remove")
    {
        count = count - 1; 
    }

    document.getElementById("product-count").innerHTML = count; 

    console.log(count);

}