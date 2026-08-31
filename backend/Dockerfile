FROM php:8.2-apache

RUN docker-php-ext-install pdo_pgsql \
    && a2enmod rewrite

COPY . /var/www/html

# Le point d'entrée de l'application est backend/public (pas la racine)
RUN sed -i 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf \
    && printf '<Directory /var/www/html/public>\n\tAllowOverride All\n\tRequire all granted\n</Directory>\n' >> /etc/apache2/apache2.conf \
    && mkdir -p /var/www/html/public/uploads/produits \
    && chown -R www-data:www-data /var/www/html/public/uploads

EXPOSE 80

# Railway (et la plupart des PaaS) fournissent le port d'écoute via $PORT au démarrage.
# Le choix du MPM (a2dismod/a2enmod fait au build) ne "tient" pas toujours sur Railway,
# donc on le refait au démarrage du conteneur avant de lancer Apache.
CMD sh -c "a2dismod mpm_event mpm_worker 2>/dev/null; \
    rm -f /etc/apache2/mods-enabled/mpm_event.* /etc/apache2/mods-enabled/mpm_worker.* ; \
    a2enmod mpm_prefork \
    && sed -i \"s/Listen 80/Listen \${PORT:-80}/\" /etc/apache2/ports.conf \
    && sed -i \"s/:80/:\${PORT:-80}/\" /etc/apache2/sites-enabled/000-default.conf \
    && apache2ctl -t \
    && apache2-foreground"
