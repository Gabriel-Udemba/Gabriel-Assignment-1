window.addEventListener('load', () => {
    const apiEndpoint = 'https://api.winnipegtransit.com/v3/';
    const apiKey = 'EyB5rv2iAH9LCstpfpkZ';
    const streetList = document.getElementsByClassName('streets')[0];
    const titleBar = document.getElementById('street-name');
    const tableBody = document.getElementsByTagName('tbody')[0];
    const loading = document.getElementsByClassName('loading')[0];

    const searchStreet = (street) => {
        fetch(apiEndpoint+'streets.json?name='+street+'&usage=long&api-key='+apiKey).then( response => response.json() ).then(data => {
            streetList.innerHTML = '';
            
            //The list of all the street
            if(data.streets.length > 0){
                data.streets.forEach(street => {
                    return streetList.insertAdjacentHTML('afterbegin', `<a href="#" data-street-key="${street.key}">${street.name}</a>`)      
                });
            }
            else{
                streetList.insertAdjacentHTML('afterbegin', '<span class="no-street">No streets found!,  try  another  keyword</span>');
            }
        });
    }

    const getAllBuses = (street) => {
        titleBar.innerText = '';
        tableBody.innerText = '';
        loading.style.visibility = 'visible'

        fetch(apiEndpoint+'stops.json?street='+street+'&api-key='+apiKey).then( response => response.json() ).then(data => {
            if(data.stops.length==0){
                alert('No schedule stops found for selected street');
                loading.style.visibility = 'hidden'
                return false;
            }
            loading.style.visibility = 'hidden'

            data.stops.map(stops => {
                fetch(apiEndpoint+'stops/'+stops.key+'/schedule.json?max-results-per-route=2&api-key='+apiKey) //maps through all stops
                .then(response => response.json())
                .then(data => {
                    let schedule = data['stop-schedule'];
                    let stopName = schedule['stop']['street']['name'];
                    let crossStreet = schedule['stop']['cross-street'];
                    let direction = schedule['stop']['direction'];
                    let routeNumber = schedule['route-schedules'][0]!=undefined ? schedule['route-schedules'][0]['route']['key'] : 'N/A'

                    let nextBusTime = null;
                    if( schedule['route-schedules'][0] != undefined) {
                        nextBusTime = schedule['route-schedules'][0]['scheduled-stops'][0]['times']['arrival']['scheduled'] //next lift
                    }
                    return schedules({
                        stopName,
                        crossStreet,
                        direction,
                        routeNumber,
                        nextBusTime
                    });
                });
            })
        });
    }

    const schedules = (data) => {
        let date = new Date(data.nextBusTime);
        titleBar.innerText = `Displaying results for ${data.stopName}`; //street
        
        tableBody.insertAdjacentHTML('afterbegin', `
            <tr>
                <td>${data.stopName}</td>
                <td>${data.crossStreet.name}</td>
                <td>${data.direction}</td>
                <td>${data.routeNumber}</td>
                <td>${date.toLocaleString('en-US', { 
                    hour: 'numeric', minute: 'numeric', hour12: true })}</td>
            </tr>
        `);
    }

    //search for the street
    document.getElementsByTagName('form')[0].addEventListener('submit', (e) => {
        e.preventDefault();
        const street = e.target[0].value;

        if(street != '' && street.length >0){
            return searchStreet(street)
        }
        return 0;
    })

    //Fetch all Bus
    streetList.addEventListener('click', (e) => {
        const isClickableStreetLink = e.target.nodeName == 'A' ? true : (false)
        const streetKey = e.target.dataset['streetKey'];

        if(isClickableStreetLink){
            return getAllBuses(streetKey)
        }
    })
});