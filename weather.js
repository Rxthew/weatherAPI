
const weatherApp = (function(){
    const submit = document.querySelector('#submitCity')
    const key = 'def79d73d53551dbf22c188d97884e98';
    const parseWeatherData = function(weatherData){
       
        //Array of labels to be used, and object keys from weatherData to return values we need//
        const labelsAndTargets = 
        [
            ['Date', 'dt_txt'],
            ['Forecast', 'description'],
            ['Temperature', 'temp'],
            ['Humidity', 'humidity'],
            ['Feels like', 'feels_like'],


        ];

        const dateParser = function(currentDate = '1500-01-01'){

            const dateChecker = function(dateString){
                const thisDate = dateString.slice(0,10);

                if (currentDate === thisDate){
                    return [dateString.slice(10,), currentDate]
                }
                currentDate = thisDate;
                return [dateString, currentDate]
    
            }

            return dateChecker

            
        }
        

        const parseIndividualValue = function(someLabelsAndTargets,someFinalArray,weatherListElem){
            for (let someLabelAndTarget of someLabelsAndTargets){
    
                const weatherObj = {};
                let label = someLabelAndTarget[0];
                let target = someLabelAndTarget[1];
                
                if(weatherListElem.hasOwnProperty(target)){

                    weatherObj[label] = weatherListElem[target];
                    someFinalArray.push(weatherObj); 
                }
                
            }
        }
        
        const parseAllValues = function(){
            const finalArray = []

            let dateChecker = dateParser();

            const dateFixer = function(){
                    
                if (finalArray.length === 0){
                    return
                }
                let last = finalArray[finalArray.length - 1];
                if (last.hasOwnProperty('Date')){

                    //Call dateChecker function
                    dateChecked = dateChecker(last['Date']);

                    //Update date if necessary, else give time instead.
                    last['Date'] = dateChecked[0];

                    if(last['Date'].length < 11){

                        last['Time'] = dateChecked[0];
                        delete last['Date'];
                    }

                    //Renew currentDate
                    let currentDate = dateChecked[1];

                    //Update dateChecker function with updated currentDate for next iteration.
                    dateChecker = dateParser(currentDate);        

                }
            }

            for (let elem of weatherData.list){
                       
                parseIndividualValue(labelsAndTargets, finalArray, elem);
                dateFixer();
                parseIndividualValue(labelsAndTargets, finalArray, elem.main);
                parseIndividualValue(labelsAndTargets, finalArray, elem.weather[0])
            }
            return finalArray; 
        }    

        
        return parseAllValues()    
        
        }
        
    const weatherObjectToDOM = function(finalArray){

        const weatherContainer = document.querySelector('#weatherContainer');

        const convertorFunction = (function(){
            for (let obj of finalArray){
                let component = document.createElement('span');
                let text = document.createElement('p');
                text.textContent = (function(){
                    for (let [key,value] of Object.entries(obj)){
                        return `${key} : ${value}`
                    }  
                })()
                component.appendChild(text)
                weatherContainer.appendChild(component)
            }
        })()


        return
    }    
    
    const weatherData = function(){
                         let city = document.querySelector('#cityInput').value;
                         fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${key}`, {mode:'cors'})
                        .then(function(response){return response.json()})
                        .then(function(info){return parseWeatherData(info)})
                        .then(function(weatherObj){return weatherObjectToDOM(weatherObj)})
    }
    submit.addEventListener('click', weatherData);
})()
