function login() {

    let passord   = document.querySelector('#passord').value;
    let brukerid  = document.querySelector('#brukerid').value;

    let url       = new URL('/login/'+brukerid, 'http://localhost:1234')

    fetch( url, {
	method:       'put'                          ,
	body:         '{"passord":"' + passord + '"}',
	credentials:  'include'                           ,
	headers: {'Content-Type': 'application/json'}
    }
	 )
}

function oppdater() {

    let brukerid  = document.querySelector('#brukerid').value;
    let passord   = document.querySelector('#passord').value;
    let fornavn   = document.querySelector('#fornavn').value;
    let etternavn = document.querySelector('#etternavn').value;

    let url       = new URL('/person/'+brukerid, 'http://localhost:1234')

    fetch( url, {
	method:       'put',
	body:         '{"fornavn":"' + fornavn + '", "etternavn":"' + etternavn + '"}',
	credentials:  'include' ,
	headers: {'Content-Type': 'application/json'}
    }
	 )
}

function ny() {

    let brukerid  = document.querySelector('#brukerid').value;
    let passord   = document.querySelector('#passord').value;
    let fornavn   = document.querySelector('#fornavn').value;
    let etternavn = document.querySelector('#etternavn').value;

    let url       = new URL('/person/', 'http://localhost:1234')

    fetch( url, {
	method:       'post',
	body:         '{"brukerid":"' + brukerid + '","fornavn":"' + fornavn + '", "etternavn":"' + etternavn + '"}',
	credentials:  'include' ,
	headers: {'Content-Type': 'application/json'}
    })
}

function slett() {

    let brukerid  = document.querySelector('#brukerid').value;
    let url       = new URL('/person/' + brukerid, 'http://localhost:1234')

    fetch( url, {method:'delete', credentials:  'include'} )

}

function liste() {

    let brukerid  = document.querySelector('#brukerid').value;
    let url       = new URL('/person/'+ brukerid, 'http://localhost:1234')
    window.location.href = url;
}
