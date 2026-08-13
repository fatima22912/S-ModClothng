FROM php:8.2-apache

RUN docker-php-ext-install pdo_mysql \
    && a2enmod rewrite
RUN docker-php-ext-install pdo_mysql \
    && a2enmod rewrite \
    && a2dismod mpm_event mpm_worker 2>/dev/null; a2enmod mpm_prefork

COPY . /var/www/html

# Le point d'entrée de l'application est backend/public (pas la racine)
RUN sed -i 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf \
    && printf '<Directory /var/www/html/public>\n\tAllowOverride All\n\tRequire all granted\n</Directory>\n' >> /etc/apache2/apache2.conf \
    && mkdir -p /var/www/html/public/uploads/produits \
    && chown -R www-data:www-data /var/www/html/public/uploads

EXPOSE 80

# Railway (et la plupart des PaaS) fournissent le port d'écoute via $PORT au démarrage
CMD sh -c "sed -i \"s/Listen 80/Listen \${PORT:-80}/\" /etc/apache2/ports.conf \
    && sed -i \"s/:80/:\${PORT:-80}/\" /etc/apache2/sites-enabled/000-default.conf \
    && apache2-foreground"
