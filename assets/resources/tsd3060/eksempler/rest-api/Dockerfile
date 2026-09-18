FROM httpd:alpine
WORKDIR /usr/local/apache2/

# Installerer DBMS
RUN apk add sqlite

# Aktiverer CGI
RUN echo "LoadModule cgi_module modules/mod_cgi.so" >> conf/httpd.conf; \
    echo "AddHandler cgi-script .cgi"               >> conf/httpd.conf

# Lar alle forespørsler håndteres av index.cgi
RUN sed -i 's|ScriptAlias .*|ScriptAliasMatch .* /usr/local/apache2/cgi-bin/index.cgi|' conf/httpd.conf

# Oppretter database
ARG SQL="CREATE TABLE Bok (bokId SMALLINT PRIMARY KEY, tittel VARCHAR(200) NOT NULL);"
RUN echo $SQL | sqlite3 bokbase.db

# Setter inn eksempeldata
ARG SQL="INSERT INTO Bok VALUES (1,'Den første og beste'),(2,'Sist men ikke minst');"
RUN echo $SQL | sqlite3 bokbase.db

COPY ./index.cgi /usr/local/apache2/cgi-bin/index.cgi
