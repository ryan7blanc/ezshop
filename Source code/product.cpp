#include "product.h"
#include <iostream>

using namespace std;

product::product(){
    name = "";
    description = "";
    price = 0;
    review = 0;
}

product::product(string name, string description, int price, int review){
    this->name = name;
    this->description = description;
    this->price = price;
    this->review = review;
}

string product::getname(){
   return this->name; 
}

string product::getdescription(){
   return this->description; 
}

int product::getprice(){
   return this->price; 
}

int product::getreview(){
   return this->review; 
}

void product::setname(string name){
   this->name = name; 
}

void product::setdescription(string description){
   this->description = description; 
}

void product::setprice(int price){
   this->price = price; 
}

void product::setreview(int review){
   this->review = review; 
}