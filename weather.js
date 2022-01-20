
const weatherApp = (function(){
    const submit = document.querySelector('#submitCity')
    const weatherContainer = document.querySelector('#weatherContainer');
    const key = 'def79d73d53551dbf22c188d97884e98';
    const malleables = {
        'currentDate': '1500-01-01',
        'benchmarkTime': '25:00:00',
         'hidden' : false
    }


    const removePriorData = function(){
        if(weatherContainer.children.length > 0){
            Array.from(weatherContainer.children).forEach(
                node => node.remove()
            )
            document.querySelector('#tempContainer').remove()
        }
    }

    const removeLoadingSpinner = function(){
        let spinner = document.querySelector('#spin')
        if(spinner){
            spinner.remove()
        }
        return
    }

    const setTemperatureState = function(){
        if(document.querySelector('.toggleCelsius') || document.querySelector('.sessionCelsius')){
            sessionStorage.setItem('sessionCelsius',true);
            return
        }
    }

    const errorCard = class{
        constructor(error){
            this.error = error
        }

        closeErrorCard = function(errCard){
            errCard.classList.toggle('closeError',true);
            errCard.remove();
        }

        makeErrorCard = function(){
            let closeError = this.closeErrorCard;
            let openErrorCard = document.querySelector('.errorCard')
            if(openErrorCard){
                closeError(openErrorCard)
            }
            

            let card = document.createElement('div');
            let headline = document.createElement('span');
            let msg = document.createElement('span');
            let x = document.createElement('button');

            msg.textContent = this.error;
            headline.textContent = 'Something went wrong.'
            x.textContent = '\u2716';

            card.classList.add('errorCard');
            headline.classList.add('headline');
            msg.classList.add('msg');
            x.classList.add('xButton');

            card.appendChild(headline);
            card.appendChild(msg);
            card.appendChild(x);
            document.body.appendChild(card);
            
            document.body.addEventListener('click', function(){
                closeError(card)}, {once:true})      
        }
    }

    const parseWeatherData = function(weatherData){
   
        //Array of labels to be used, and object keys from weatherData to return values we need//
        const labelsAndTargets = 
        [
            ['Date', 'dt_txt'],
            ['Forecast', 'description'],
            ['Temperature', 'temp'],
            ['humidity', 'humidity'],
            ['feels like', 'feels_like'],


        ];


       const kelvinToFahrenheit = function(num){
            return parseInt(((num-273.15)*1.8)+32).toString()
              
       }

       const kelvinToCelsius = function(num){
           return parseInt(num - 273.15).toString();


       }

       const setKelvinStorage = function(){
        if(sessionStorage.getItem('kelvinArray')){
            sessionStorage.removeItem('kelvinArray');
            sessionStorage.setItem('kelvinArray',[])
       }

    }
        
        const parseIndividualValue = function(someLabelsAndTargets,someFinalArray,weatherListElem){

            for (let someLabelAndTarget of someLabelsAndTargets){
    
                const weatherObj = {};
                let label = someLabelAndTarget[0];
                let target = someLabelAndTarget[1];
                
                if(weatherListElem.hasOwnProperty(target)){

                    weatherObj[label] = weatherListElem[target];
                    
                    if(label === 'Temperature' || label === 'feels like'){
                        if(sessionStorage.getItem('sessionCelsius')){
                            weatherObj[label] = kelvinToCelsius(weatherObj[label])
                        }
                        else {
                            weatherObj[label] = kelvinToFahrenheit(weatherObj[label])
                        }
                        
                    }
                    someFinalArray.push(weatherObj); 
                }
                
            }
        }
        
        const parseAllValues = function(){
            const finalArray = []
            setKelvinStorage()

            for (let elem of weatherData.list){
                parseIndividualValue(labelsAndTargets, finalArray, elem);
                implementTime(finalArray);
                parseIndividualValue(labelsAndTargets, finalArray, elem.main);
                parseIndividualValue(labelsAndTargets, finalArray, elem.weather[0])
            }
            return finalArray; 
        }
        
        const setBenchmarkTime = function(timeString){
               let benchmarkTime = malleables.benchmarkTime;
            if (benchmarkTime === '25:00:00'){
                malleables.benchmarkTime = timeString
            }
            return malleables.benchmarkTime
        }

        const dateFixer = function(date){
            const newDate = new Date(date);
            const fixedDate = newDate.toString().slice(0,15);
            return fixedDate

        }
        
        const timeHarmoniser = function(dateString){

            const thisDate = dateString.slice(0,10);
            const thisTime = dateString.slice(11,)
            let currentDate = malleables.currentDate;
            let benchmarkTime = setBenchmarkTime(thisTime);
           
            if (currentDate !== thisDate){
                malleables.currentDate = thisDate;
                currentDate = thisDate;
            }

            return [currentDate,thisTime]
    
        }

        const implementTime = function(finalArray){
               
            if (finalArray.length === 0){
                return
            }
            let last = finalArray[finalArray.length - 1];
            if (last.hasOwnProperty('Date')){
 
                //Call timeHarmoniser function
                let dateChecked = timeHarmoniser(last['Date']);
 
                //Update date and time to correct format.
                last['Date'] = dateFixer(dateChecked[0]);
                last['Time'] = dateChecked[1];

            }
        }

        return parseAllValues()   
        
        }
       
        
    const weatherObjectToDOM = function(finalArray){

        removeLoadingSpinner()
        removePriorData();

        const temperatureConvertor = function(){

            const temperatureSlicer = function(tempString){

                const firstOutput = tempString.slice(0,tempString.length - 1);
                const metricUnit = tempString.slice(tempString.length - 1,);

                if(isNaN(+firstOutput)){
                    const feelsLike = firstOutput.slice(0,11);
                    const digits = firstOutput.slice(11,);
                    return [digits, metricUnit,feelsLike]
                }

                else{
                    return[firstOutput, metricUnit]
                }

            }

            const tempAlgoApply = function(valuesArray){//here 
                let finalString;
                const digits = +(valuesArray[0]);
                const metricUnit = valuesArray[1];
                const feelsLike = valuesArray.length > 2 ? valuesArray[2] : null;
                
                if(isNaN(digits)){
                    return
                };
                
                if(metricUnit === '\u2109'){
                    let cels = (digits-32)/1.8
                    finalString = parseInt(cels) + '\u2103'

                }
                else if(metricUnit === '\u2103'){
                   let fahren = (digits * 1.8) + 32
                    finalString = parseInt(fahren) + '\u2109'
                }

                if(feelsLike){
                    finalString = feelsLike + finalString;
                }
                return finalString
            }
            
            const convert = (function(){
                tempsConverted = Array.from(document.querySelectorAll('.metricUnit'));
                for (let elem of tempsConverted){
                    let current = elem.textContent;
                    elem.textContent = tempAlgoApply(temperatureSlicer(current))
                }
            })() 

        }

        const addTemperatureToggler = (function(){
            
            const weatherInput = document.querySelector('#weatherInput');
            
            const tempContainer = document.createElement('div');
            tempContainer.id = 'tempContainer';

            const fahrenheit = document.createElement('span');
            fahrenheit.id = 'fahrenheitSelect'
            fahrenheit.textContent = '\u2109'
            tempContainer.appendChild(fahrenheit);
            
            const tempToggler = document.createElement('div');
            tempToggler.id = 'tempToggler'
            tempContainer.appendChild(tempToggler);

            const celsius = document.createElement('span');
            celsius.id = 'celsiusSelect';
            celsius.textContent = '\u2103'
            tempContainer.appendChild(celsius)


            weatherInput.appendChild(tempContainer);

            const tempTogglerContents = (function(){
                const tempButton = document.createElement('button');
                tempButton.id = 'temperatureBtn'                                

                tempToggler.appendChild(tempButton);

                const assignSessionChoice = (function(){
                    if(sessionStorage.getItem('sessionCelsius')){
                        tempButton.classList.add('sessionCelsius');
                        sessionStorage.removeItem('sessionCelsius')
                    }
                })()
            })()

            const toggleTemperatureButton = function(){
                const btn = document.querySelector('#temperatureBtn');
                if (btn.classList.contains('toggleFahrenheit')){
                    btn.classList.toggle('toggleFahrenheit',false);
                    btn.classList.toggle('toggleCelsius',true);
                }
                else if(btn.classList.contains('toggleCelsius')){
                    btn.classList.toggle('toggleCelsius',false);
                    btn.classList.toggle('toggleFahrenheit',true);   
                }
                else if(btn.classList.contains('sessionCelsius')){
                    btn.classList.toggle('sessionCelsius', false);
                    btn.classList.toggle('toggleFahrenheit',true);
                }
                else{
                    btn.classList.toggle('toggleCelsius',true);
                }
            }

            tempToggler.addEventListener('click',toggleTemperatureButton);
            tempToggler.addEventListener('click', temperatureConvertor);

        })()

        let toggleHideData = function(someElement){
            let hidden = malleables.hidden;
            if (hidden){
                someElement.classList.toggle('none', true)
            }
        }

        let guardForVisibility = function(obj,component){
            if(obj.hasOwnProperty('Time')){
                if(obj['Time'] === malleables.benchmarkTime){
                    malleables.hidden = false;
                    
                }
                else {
                    malleables.hidden = true;
                }
                
            }
            toggleHideData(component)  
                
        }

        const timeToggler = function(event){
            const referencePoint = event.target.parentElement;
            const currentTimeInput = referencePoint.children[2];
            const cardChildren = Array.from(referencePoint.parentElement.children);

            const hideCurrent = function(){
                for(let i = cardChildren.indexOf(referencePoint); i < cardChildren.length; i++){
                    let target = cardChildren[i];
                    if(target.classList.contains('Time') && target !== referencePoint){
                        return i
                    }
                    target.classList.toggle('none',true)
              }
            }

            const laterVersion = function(currentIndex){
                
                for(let i = currentIndex;i < cardChildren.length; i++){

                    let reveal = cardChildren[i];
                    if(reveal.classList.contains('Time') && reveal !== cardChildren[currentIndex]){
                        return
                    }
                    reveal.classList.toggle('none',false);

                    }
            }

            const earlierVersion = function(){

                for(let i = cardChildren.indexOf(referencePoint) - 1;i >= 0; i--){
                    let reveal = cardChildren[i];
                    if(reveal.classList.contains('Time')){
                        reveal.classList.toggle('none',false);
                        return
                    }
                    reveal.classList.toggle('none',false);
                    }
            }
            
            const executeToggle = (function(){

                if(event.target.classList.contains('later')){
                    if(currentTimeInput.textContent === '21:00:00'){
                        event.stopPropagation()
                        let error = new errorCard('This is the last report for the day. ');
                        error.makeErrorCard()
                        return
                       
                    }
                    let ind = hideCurrent();
                    laterVersion(ind)
                }
                else if(event.target.classList.contains('earlier')){
                    if(cardChildren[0] === referencePoint){
                        event.stopPropagation()
                        let error = new errorCard('There are no earlier reports available for the day.');
                        error.makeErrorCard()
                        return
                    }
                    hideCurrent()
                    earlierVersion()   
                }

            })()
            return
        }

        const componentHandler = function(obj){

            const dateAndTime = function(){
                let div = document.createElement('div');
                div.classList.toggle('Time',true)

               const dateText = (function(){
                   let dateComponent = document.createElement('span');
                   dateComponent.textContent = `${Object.values(obj)[0]}`;
                   dateComponent.classList.toggle('dateText',true)
                   div.appendChild(dateComponent);
               })()

                const earlierButton = (function(){
                    let earlier = document.createElement('button');
                    earlier.textContent = '<';
                    earlier.classList.toggle('earlier',true);
                    earlier.addEventListener('click',timeToggler)
                    div.appendChild(earlier);                   
                })()
            
                const timeText = (function(){

                    let component = document.createElement('span');
                    component.textContent = `${Object.values(obj)[1]}`
                    component.classList.toggle('timeText',true)
                    div.appendChild(component);
                    
                })()

                const laterButton = (function(){
                    let later = document.createElement('button');
                    later.textContent = '>';
                    later.classList.toggle('later',true);
                    later.addEventListener('click',timeToggler)
                    div.appendChild(later);
                    
                })()

                return div

            }
            const metricSpecificData = function(){
                let component = document.createElement('span');
                if(obj.hasOwnProperty('humidity')){
                    component.textContent = `${Object.entries(obj)[0][1]}% ${Object.entries(obj)[0][0]}`;
                    component.classList.toggle(`${Object.entries(obj)[0][0]}`,true);
                    return component
                }
                else if (obj.hasOwnProperty('feels like')){
                    component.textContent = (function(){
                      if(document.querySelector('.sessionCelsius')){
                          return `${Object.entries(obj)[0][0]} ${Object.entries(obj)[0][1]}\u2103`
                      }   
                      else {return `${Object.entries(obj)[0][0]} ${Object.entries(obj)[0][1]}\u2109` }  

                    })();
                    component.classList.toggle('feelsLike',true);
                    component.classList.toggle('metricUnit',true);
                    return component

                }
                else {
                    component.textContent = (function(){
                        if(document.querySelector('.sessionCelsius')){
                            return `${Object.values(obj)[0]}\u2103`
                        }   
                        else {return `${Object.values(obj)[0]}\u2109` }  
  
                      })();
                    component.classList.toggle(`${Object.keys(obj)[0]}`,true)
                    component.classList.toggle('metricUnit',true);
                    return component
                }

            }
            const forecast = function(){
                let component = document.createElement('span');
                component.textContent = `${Object.values(obj)[0]}`
                component.classList.toggle(`${Object.keys(obj)[0]}`,true)
                return component

            }

            const writeAccordingToOutcome = (function(){
                if (obj.hasOwnProperty('Forecast')){
                    return forecast();
                }
                else if(obj.hasOwnProperty('Time')){
                    return dateAndTime();
                }
                else{
                    return metricSpecificData();
                }
            })()

            return writeAccordingToOutcome
        }
        
        const convertorFunction = (function(){

            const secondaryContainer = (function(){
                const secondary = document.createElement('div');
                secondary.id = 'secondaryContainer';
                weatherContainer.appendChild(secondary);
                return secondary;
            })()
               
            for (let obj of finalArray){
                
                let card = (function(){
                    if(weatherContainer.children.length === 1 || obj['Time'] === '00:00:00'){
                        let div =  document.createElement('div');
                        div.classList.toggle('card',true);
                        return div;
                    }
                    if (secondaryContainer.children.length !== 0){
                        return secondaryContainer.children[secondaryContainer.children.length - 1]
                    }
                    return document.querySelector('.mainCard')
                })()
                
                let component = componentHandler(obj)
                guardForVisibility(obj, component)
                card.appendChild(component)

                
                const mainOrSecondary = (function(){

                    const weatherContChildren = Array.from(weatherContainer.children);
                    const secondaryContChildren = Array.from(secondaryContainer.children);

                    if(weatherContainer.children.length === 1){
                        card.classList.toggle('mainCard', true)

                        if(!weatherContChildren.includes(card)){
                        weatherContainer.appendChild(card);
                        }
                    }
                    else{
                        if(!weatherContChildren.includes(card) && !secondaryContChildren.includes(card)){
                            secondaryContainer.appendChild(card);
                        }                            
                    }
                }())
                
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
                        .catch(function(e){     
                            let error = (function(){
                                if(e.message === 'weatherData.list is undefined'){
                                    if(city.length === 0){
                                        return new errorCard('Please enter the name of a city.')
                                    }
                                    return new errorCard(`No weather data is available for "${city}". Please enter the name of another city.`)
                                }
                                else if(e.message === 'NetworkError when attempting to fetch resource.'){
                                    return new errorCard('There seem to be some connection problems. The data cannot be retrieved before these are solved.')

                                }
                                else{
                                    console.error(e);
                                    return new errorCard('A problem has occurred. Please restart your browser.');
                                }
                            })() 
                            error.makeErrorCard();
                            removeLoadingSpinner()
                            
                            return
                        })
                        
                        const loader = (function(){
                            if(document.querySelector("#spin")){
                                return
                            }
                            setTemperatureState();
                            removePriorData()
                            const spinner = document.createElement('div');
                            spinner.id = 'spin'
                            weatherContainer.appendChild(spinner);
                        })()
    }
    submit.addEventListener('click', weatherData);
})()
