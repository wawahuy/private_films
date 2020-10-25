#!/usr/bin/env bash

help() {
  cat <<EOF
  Arguments:
  +\$1 given domain
  +\$2 given port forward

  Usage example:
  $ ./add-subdomain-nginx.sh jenkins.giayuh.com 8080
EOF
}

# init vars
DOMAIN=$1
PORT=$2
DIR_NGINX_SITE_ENABLE="/etc/nginx/sites-enabled"
# DIR_NGINX_SITE_ENABLE="test"
FILE_SUBDOMAIN_CONFIG="${DIR_NGINX_SITE_ENABLE}/${DOMAIN}"

if [[ -z $DOMAIN ]] || [[ -z $PORT ]]; then
  help
  exit 1
fi

if test -f "$FILE_SUBDOMAIN_CONFIG"; then
    echo "$FILE_SUBDOMAIN_CONFIG exists."

    read -p "Rewrite (y/n)? " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]
    then
        exit 1
    fi
fi

echo """
  server {
      listen 80;
      server_name ${DOMAIN};

      location / {
          proxy_pass http://127.0.0.1:${PORT};
          proxy_set_header Host ${DOMAIN};
          proxy_redirect off;
      }   
  }
""" >$FILE_SUBDOMAIN_CONFIG

echo "Complete ${DOMAIN} with port ${PORT} at ${FILE_SUBDOMAIN_CONFIG}"


#restart
read -p "Restart nginx (y/n)? " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

systemctl restart nginx
