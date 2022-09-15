
// show the number to table

var table_row = document.querySelectorAll("tbody > tr")

for(i in table_row){
   let  n = parseInt(i )+1;
   var th = table_row[i].children[0]
   th.innerHTML=n
   
}




