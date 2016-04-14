# DIR => /PHP5.5
new laravel intermap

# PGSQL => Homestead
psql -U homestead -W -h localhost
pass => secret
create database intermap;
\q

# IN => config/database.php
    'default' => env('DB_CONNECTION', 'pgsql'),

    'pgsql' => [
            'driver' => 'pgsql',
            'host' => env('DB_HOST', 'localhost'),
            'port' => env('DB_PORT', '5432'),
            'database' => env('DB_DATABASE', 'intermap'),
            'username' => env('DB_USERNAME', 'homestead'),
            'password' => env('DB_PASSWORD', 'secret'),
            'charset' => 'utf8',
            'prefix' => '',
            'schema' => 'public',
    ],

# IN PHP5.5/intermap
nano .env

-- Change: --
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=intermap
DB_USERNAME=homestead
DB_PASSWORD=secret
 

# In PHP5.5/intermap/packages.json 
"laravel-elixir": "*",

then =>
	npm install
        gulp 
