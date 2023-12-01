<<<<<<< HEAD
=======

function openModal()
{
    let product = document.getElementById('popUp');
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
}
>>>>>>> bc6d99f69c24aad49bd882e08ab6713041687638
