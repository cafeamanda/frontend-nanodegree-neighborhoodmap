# Front-End Nanodegree Neighborhood Map

This project was built under the Udacity Front-End Web Developer Nanodegree Program. It consists of a single page application featuring a map of Manhattan. Although Manhattan is not where I live, it felt like a good choice for its sense of familiarity with the whole World and the amount of information there is about it online, given that the project uses the MediaWiki API to gather articles about the establishments displayed on the map.


## How does it work?

**To access the application, [click here](http://neighborhood-map.s3-website-sa-east-1.amazonaws.com/).**

:round_pushpin: You'll see a map of Manhattan and 20 markers. Click on them to see them bounce and display more information about a selected place.

:round_pushpin: You can also toggle a list of places by clicking on the hamburger icon at the top left corner of the screen. Click on an item to see its respective marker bounce and display more information about the selected place.

:round_pushpin: You can also filter the markers and the items on the list by writing what you're looking for in the sidemenu's input box. For example, type in "hotel" and only hotels will appear on the map and on the list. (The filter is case-insensitive)


## How to run the application locally

1. Clone or download this repository to a folder on your computer. To clone it, open your terminal, navigate to a folder of your choosing and type:
```
git clone https://github.com/cafeamanda/frontend-nanodegree-neighborhoodmap.git
```
into the command line.

2. To run the application, you can manually open the `index.html` file by clicking on it in your file manager or via terminal, by navigating to the local repository folder and typing:
```
open -a "Google Chrome" index.html
```
or simply
```
google-chrome index.html
```
if you're on a linux machine.


## Project details

This project uses technologies such as:
* **Javascript**, for application logic
* **Knockout**, for a MVVM structure
* **Google Maps API**, for data on the map
* **MediaWiki API**, for data on related articles
* **Bootstrap**, for a gridding system
* **jQuery**, for interactive styling
* **CSS**, for styling


## How to contribute

To help me with improving this project you can fork this repository, make your proposed changes and apply your branch for a merge. You can also contact me via e-mail at [contato@cafeamanda.com.br](contato@cafeamanda.com.br). Thank you!
