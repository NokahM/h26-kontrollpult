function lagre_passord() {

    let URL     = 'https://debbie.usn.no/da-nan3000/eksempler/opphav/mottager.cgi';
    let passord = document.querySelector('#passord').value;

    fetch(URL, { method: 'POST', body: passord, credentials: 'include' })
	.then( respons    => respons.text()     )
	.then( http_kropp => alert(http_kropp)  )

}
