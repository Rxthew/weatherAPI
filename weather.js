//Things to do: 
//1) Error Handling implementation
//2) Delete data in weather container between each call. HERE ******
//3) Loading component
//4) Style the damn thing. 
//        -> everything outside info section is blue with hand-drawn clouds
//        -> Five cards. One larger one at the top representing today. Four at the bottom. You toggle +3 or -3 hours and they all change corresponding to that. 
//5) Download linter & prettify to check against.  


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
            this.currentDate = '1500-01-01'

            for (let elem of weatherData.list){
                       
                parseIndividualValue(labelsAndTargets, finalArray, elem);
                dateFixer(finalArray);
                parseIndividualValue(labelsAndTargets, finalArray, elem.main);
                parseIndividualValue(labelsAndTargets, finalArray, elem.weather[0])
            }
            return finalArray; 
        } 
        
        const dateChecker = function(dateString){
            currentDate = this.currentDate;
           
            const thisDate = dateString.slice(0,10);

            if (currentDate === thisDate){
                return [dateString.slice(10,), currentDate]
            }
            currentDate = thisDate;
            return [dateString, currentDate]
    
        }.bind(parseAllValues)

        const dateFixer = function(finalArray){
               
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
                this.currentDate = currentDate      
 
            }
        }.bind(parseAllValues)

        
        return parseAllValues()    
        
        }
       
        
    const weatherObjectToDOM = function(finalArray){

        const weatherContainer = document.querySelector('#weatherContainer');

        const removePriorData = (function(){
            if(weatherContainer.children.length > 0){
                Array.from(weatherContainer.children).forEach(
                    node => node.remove()
                )
            }
        })()

        let toggleLatentData = function(spanElement){
            hidden = this.hidden;
            if (hidden){
                spanElement.classList.toggle('none', true)
            }
        }

        let guardForVisibility = function(obj,component){
            if(obj.hasOwnProperty('Date')){
                this.hidden = false;
                
            }
            else if (obj.hasOwnProperty('Time')){
                this.hidden = true;
            }
            toggleLatentData(component)  
        }
        
        const convertorFunction = (function(){
            
            const bindHelperFunctions = (function(){
                this.hidden = false;
                toggleLatentData = toggleLatentData.bind(this);
                guardForVisibility = guardForVisibility.bind(this);
            })()
                
            for (let obj of finalArray){
                
                let card = (function(){
                    if(obj.hasOwnProperty('Date')){
                        return document.createElement('div')
                    }
                    return document.querySelectorAll('div')[document.querySelectorAll('div').length - 1]
                })()

                let component = document.createElement('span');
                guardForVisibility(obj, component)
                component.textContent = (function(){
                    for (let [key,value] of Object.entries(obj)){
                        return `${key} : ${value}`
                    }  
                })()
                card.appendChild(component)
                weatherContainer.appendChild(card)
            }
        })()

        return
    }    
    
    const weatherData = function(){
                         let city = document.querySelector('#cityInput').value;
                         fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${key}`, {mode:'cors'})
                        .then(function(response){return response.json()})
                        //.then(function(info){console.log(parseWeatherData(info))})
                        .then(function(info){return parseWeatherData(info)})
                        .then(function(weatherObj){return weatherObjectToDOM(weatherObj)})
    }
    submit.addEventListener('click', weatherData);
})()
