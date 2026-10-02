function oppdater() {

    let epost     = document.querySelector('#epost').value;
    let telefon   = document.querySelector('#telefon').value;
    let fornavn   = document.querySelector('#fornavn').value;
    let etternavn = document.querySelector('#etternavn').value;

    let url       = new URL('/person/'+epost, 'http://localhost:8090')

    fetch( url, {
	method:       'put',
	body:         '{"fornavn":"' + fornavn + '", "etternavn":"' + etternavn + '", "telefon":"' + telefon + '"}',
	headers: {'Content-Type': 'application/json'}
    }
	 )

}

function ny() {

    let epost     = document.querySelector('#epost').value;
    let telefon   = document.querySelector('#telefon').value;
    let fornavn   = document.querySelector('#fornavn').value;
    let etternavn = document.querySelector('#etternavn').value;

    let url       = new URL('/person/', 'http://localhost:8090')

    fetch( url, {
	method:       'post',
	body:         '{"epost":"' + epost + '","fornavn":"' + fornavn + '", "etternavn":"' + etternavn +  '", "telefon":"' + telefon + '"}',
	headers: {'Content-Type': 'application/json'}
    })
}

function slett() {

    let epost     = document.querySelector('#epost').value;
    let url       = new URL('/person/' + epost, 'http://localhost:8090')

    fetch( url, {method:'delete'} )

}

function liste() {

    let epost  = document.querySelector('#epost').value;
    let url    = new URL('/person/'+ epost, 'http://localhost:8090')
    window.location.href = url;
}
