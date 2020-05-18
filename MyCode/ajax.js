function makeAjaxCall(url, methodType){
   let promiseObj = new Promise(function(resolve, reject){
         // console.log(url); // debug
   			 let xmlhttp = new XMLHttpRequest();
         xmlhttp.open(methodType, url, true);
         xmlhttp.send();
         xmlhttp.onreadystatechange = function(){
           if (xmlhttp.readyState === 4){
              if (xmlhttp.status === 200){
                 let serverResponse = xmlhttp.responseText; //server antwoord met string
                 resolve(serverResponse); // wordt via return promiseObj teruggegeven
              } else {
              	reject(xmlhttp.status);
              }
           }
        }
      });
   return promiseObj;
  }