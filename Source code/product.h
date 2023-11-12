#ifndef Product_H
#define Product_H

#include <iostream>

using namespace std;

class product {
    private:
        string name, description;
        int price, review, id;

    public:
        product();
        product(string, string, int, int, int);

        string getname();
        string getdescription();
        int getprice();
        int getreview();
        int getid();

        void setname(string);
        void setdescription(string);
        void setprice(int);
        void setreview(int);
};

#endif