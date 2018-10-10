# search

To empty the index run the following command from the solr root directory:

bin/post -c search -type text/xml -out yes -d $'<delete><query>*:*</query></delete>'

To fill the index run the following command from the solr root directory:

bin/post -c search <directory>