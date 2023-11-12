#ifndef Cart_H
#define Cart_H

#include <iostream>
#include <vector>
#include "product.h"

using namespace std;

class cart {
    private:
        vector <product> items;

    public:
        cart();
        void addcart(product);
        void removecart(product);
        int returnprice();
};

#endif 