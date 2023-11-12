#include "cart.h"
#include "product.h"

#include <iostream>
#include <vector>

using namespace std;

cart::cart(){
    vector <product> items;
}

void cart::addcart(product item){
    items.push_back(item);
}

void cart::removecart(product item){
    if (items.empty())
        cout << "Your cart is empty";
        return;

    for(int i = 0; i < items.size(); i++)
    {
        if (item.getid() == items.at(i).getid())
        {
            items.erase(items.begin() + i);
        }
    }
}

int cart::returnprice(){
    int price = 0;
    for (int i = 0; i < items.size(); i++)
    {
        price += items.at(i).getprice();
    }

    return price;
}