
# Bookstore E commerce-Website

## Table of contents

- [Introduction](#introduction)
- [Demo](#demo)
- [Run](#run)
- [Technology](#technology)
- [Features](#features)
- [License](#license)

## Introduction

A virtual ecommerce website using Node js, Express js, and MongoDb.

NOTE: Please read the RUN section before opening an issue.

## Demo

![screenshot](projcet-home.png)

The application is deployed to AWS and can be accessed through the following link:

[Shoppi on AWS](https://buyonbookstore.tk/)

The website resembles a real store and you can add products(Books) to your cart and wishlist and pay for them. If you want to try the checkout process, you can use the dummy card number/ upi/ Internet Bankinng provided by Razorpay for testing . 
also There is option for Paypal and COD payments
Please <u><b>DO NOT</b></u> provide real card number and data.



In order to access the admin panel on "/admin" you need to provide the admin email and password.


## Run

To run this application, you have to set your own environmental variables. For security reasons, some variables have been hidden from view and used as environmental variables with the help of dotenv package. Below are the variables that you need to set in order to run the application:

- razorpayKey_id :     This is the razorpay key_Id (string).

- razorpayKey_secret :  This is the razorpay key_Secret (string).

- serviceID: This is the Twilio Service Id (string).

- accountSID: This is the Twilio accountSID (string).

- authToken: This is the Twilio AuthToken (string).

- PORT: Specify the port Number

After you've set these environmental variables in the .env file at the root of the project, and intsall node modules using  `npm install`

Now you can run `npm start` in the terminal and the application should work.

## Technology

The application is built with:

- Node.js 
- MongoDB
- Express 
- Bootstrap 
- AJAX
- JQuery
- Razorpay
- Twilio

Deployed in AWS EC2 instance with Nginx reverse proxy

## Features

The application displays a Online Bookstore store that contains  Different Books and its information.

Users can do the following:

- Create an account, login or logout
- Browse available products added by the admin
- Add products to the shopping cart and wishlist
- Delete products from the shopping cart and wishlist
- Display the shopping cart
- To checkout, a user must be logged in
- Checkout information is processed using razorpay and paypal the payment is send to the admin
-Also There is option for COD
- The profile contains all the orders a user has made
- View Order details, and cancel the orders
- Update their profile
- Search and filter products
 


Admins can do the following:

- Login or logout to the admin panel
- Display sale report
- Add products
- Veiw sale reports
- View, edit or delete their products
- Change the orders status
- Manage users
- View all orders done by users
- Manage users home page 
## License

[![License](https://img.shields.io/:License-MIT-blue.svg?style=flat-square)](http://badges.mit-license.org)

- MIT License
- Copyright 2022 © [VISHNUTVM](https://github.com/vishnutvm)
