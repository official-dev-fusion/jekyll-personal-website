---
layout: post
title:  "Créer rapidement un projet de base complet avec un espace utilisateur et un back-office"
date:   2019-11-01 19:28:00
---

Depuis Symfony 4.0, il n'est plus nécessaire d'installer un bundle externe comme friendsofsymfony/user-bundle pour créer un espace utilisateur. En effet, le composant Security de Symfony est de plus en plus flexible, mais également plus simple. Pour exploiter toute sa puissance, on peut créer des Guard authenticators et des Voters pour faire des règles complexes d'autorisations. Malgré cela, il peut parfois être déroutant de créer rapidement un espace utilisateur grâce au composant Security vu toutes les possibilités qu'il nous offre.

L'équipe de Symfony a pensé à nous en ajoutant des commandes dans le maker-bundle, à partir de la version 1.8, afin de nous faciliter la tâche.

Voyons ensemble comment créer rapidement un projet de base complet avec un espace utilisateur et un back-office.

## Commençons par créer un nouveau projet Symfony :

``` console
composer create-project symfony/website-skeleton dev_fusion_skeleton_user
```
----
``` text
Installing symfony/website-skeleton (v4.3.99)
  - Installing symfony/website-skeleton (v4.3.99): Loading from cache
Created project in dev_fusion_skeleton_user
...
```
----

### Modifions le fichier .env pour configurer la base de données et créons-la

``` text
###> doctrine/doctrine-bundle ###
DATABASE_URL=mysql://root:@127.0.0.1:3306/dev_fusion_skeleton_user
###< doctrine/doctrine-bundle ###
```

``` console
php bin/console doctrine:database:create
```
----
``` text
Created database `dev_fusion_skeleton_user` for connection named default
```
----

Maintenant que nous avons un projet tout neuf, nous pouvons passer au sérieux.

## Création des utilisateurs

Nous allons créer une entité afin de pouvoir stocker nos utilisateurs et configurer le composant Security de Symfony avec cette entité.

Toutefois, rien de compliqué, il suffit juste de bien comprendre ce qui va être généré.

### Pour nous faciliter la tâche, exécutons la première commande fournit par le maker-bundle.

``` console
php bin/console make:user
```

----
``` text
 The name of the security user class (e.g. User) [User]:
 > User

 Do you want to store user data in the database (via Doctrine)? (yes/no) [yes]:
 >

 Enter a property name that will be the unique "display" name for the user (e.g. email, username, uuid) [email]:
 >

 Will this app need to hash/check user passwords? Choose No if passwords are not needed or will be checked/hashed by some other system (e.g. a single sign-on server).

 Does this app need to hash/check user passwords? (yes/no) [yes]:
 >

 created: src/Entity/User.php
 created: src/Repository/UserRepository.php
 updated: src/Entity/User.php
 updated: config/packages/security.yaml


  Success!


 Next Steps:
   - Review your new App\Entity\User class.
   - Use make:entity to add more fields to your User entity and then run make:migration.
   - Create a way to authenticate! See https://symfony.com/doc/current/security.html
```
----

Parfait, le maker-bundle, nous a créé une entité implémentant l'interface Symfony\Component\Security\Core\User\UserInterface et un UserRepository.

``` php
<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @ORM\Entity(repositoryClass="App\Repository\UserRepository")
 */
class User implements UserInterface
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=180, unique=true)
     */
    private $email;

    /**
     * @ORM\Column(type="json")
     */
    private $roles = [];

    /**
     * @var string The hashed password
     * @ORM\Column(type="string")
     */
    private $password;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUsername(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function getPassword(): string
    {
        return (string) $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function getSalt()
    {
        // not needed when using the "bcrypt" algorithm in security.yaml
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials()
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }
}
```

Il a également mis à jour notre fichier security.yaml pour configurer un password encoder et un provider.

``` yaml
security:
    encoders:
        App\Entity\User:
            algorithm: auto

    # https://symfony.com/doc/current/security.html#where-do-users-come-from-user-providers
    providers:
        # used to reload user from session & other features (e.g. switch_user)
        app_user_provider:
            entity:
                class: App\Entity\User
                property: email
```

Le code généré est bien commenté, nous pourrons continuer plus tard les modifications pour que ce soit plus représentatif de nos besoins. 

## Une connexion complète avec un formulaire en une commande

Maintenant que nous avons une classe pour nos utilisateurs, il est temps de les laisser se connecter. Vous voulez une connexion complète avec un formulaire en une commande ? Ce n'est pas un problème. La commande make:auth peut créer un système d’authentification de formulaire complet.

``` console
php bin/console make:auth
```    

----
``` text
 What style of authentication do you want? [Empty authenticator]:
  [0] Empty authenticator
  [1] Login form authenticator
 > 1

 The class name of the authenticator to create (e.g. AppCustomAuthenticator):
 > LoginFormAuthenticator

 Choose a name for the controller class (e.g. SecurityController) [SecurityController]:
 >

 Do you want to generate a '/logout' URL? (yes/no) [yes]:
 >

 created: src/Security/LoginFormAuthenticator.php
 updated: config/packages/security.yaml
 created: src/Controller/SecurityController.php
 created: templates/security/login.html.twig


  Success!


 Next:
 - Customize your new authenticator.
 - Finish the redirect "TODO" in the App\Security\LoginFormAuthenticator::onAuthenticationSuccess() method.
 - Review & adapt the login template: templates/security/login.html.twig.
```
----

Cela crée la route de connexion, le contrôleur et le template ainsi qu’un  Guard authenticator qui gère
le login de connexion, inclut la protection CSRF et redirige intelligemment en cas de succès et d'erreur. 

Le LoginFormAuthenticator a été correctement ajouté dans le firewalk main du fichier de configuration security.yaml. C'est donc cette classe qui va gérer l'authentification de nos utilisateurs.

``` yaml
    firewalls:
        ...
        main:
            anonymous: true
            guard:
                authenticators:
                    - App\Security\LoginFormAuthenticator
            logout:
                path: app_logout
        ```
              
Quelques petite modification sont à effectuer à l'intérieur de notre classe d'authentification. Cependant, rien de bien compliqué.

Nous avons un système de connexion entièrement fonctionnel en quelques minutes dans lequel nous avons le plein contrôle pour l'optimiser.

Il nous faut maintenant donner à nos utilisateurs un moyen de s'enregistrer sur notre application.

## Inscription des utilisateurs

Encore une fois le maker-bundle vient à notre secourt.

``` console
php bin/console make:registration-form
```

----
``` text
 Creating a registration form for App\Entity\User

 Do you want to add a @UniqueEntity validation annotation on your User class to make sure duplicate accounts aren't created? (yes/no) [yes]:
 >

 Do you want to automatically authenticate the user after registration? (yes/no) [yes]:
 > no

 What route should the user be redirected to after registration?:
  [0 ] _twig_error_test
  [1 ] _wdt
  [2 ] _profiler_home
  [3 ] _profiler_search
  [4 ] _profiler_search_bar
  [5 ] _profiler_phpinfo
  [6 ] _profiler_search_results
  [7 ] _profiler_open_file
  [8 ] _profiler
  [9 ] _profiler_router
  [10] _profiler_exception
  [11] _profiler_exception_css
  [12] app_login
  [13] app_logout
 > 12

 updated: src/Entity/User.php
 created: src/Form/RegistrationFormType.php
 created: src/Controller/RegistrationController.php
 created: templates/registration/register.html.twig


  Success!


 Next: Go to /register to check out your new form!
 Make any changes you need to the form, controller & template.
```
----

* Nous ajoutons une validation unique sur l'email de nos utilisateurs.
* L'utilisateur n'est pas connecté automatiquement après l'inscription, car nous allons ajouter une confirmation par email.
* Après l'inscription l'utilisateur est redirigé sur le formulaire de connexion.

## Restructuration du projet et préparation à l'optimisation

La structure des répertoires doit être modifiée, car nous avons besoin d'un back et d'un front.

Par exemple, l'inscription sera utilisée seulement dans le front et nous allons plus tard créer un formulaire d'invitation pour les administrateurs qui sera utilisé seulement dans le back.

Nous allons créer des sous-dossiers back et front dans les dossiers templates, Controller et Form.

Controller
    -> Back
    -> Front

Form
    -> Back
    -> Front
    
templates
    -> back
    -> front
    
Les fonctionnalités communes au back et au front seront à la racine des répertoires templates, Controller et Form.

Par exemple, le login, le forget_password et le reset_password seront utilisés autant pour le back que pour le front.

### Restructuration des dossiers

* Dans le dossier Controller créer un sous-dossier Back et un autre Front;
* Dans le dossier Form créer un sous-dossier Back et un autre Front;
* Dans le dossier templates créer un sous-dossier back et un autre front;
* Déplacer le RegistrationFormType dans le sous-dossier Front et modifier le namespace: namespace App\Form\Front;
* Déplacer le RegistrationController dans le sous-dossier Front et modifier le namespace et le use du formulaire;
* Déplacer le dossier templates/registration dans un sous-dossier front et modifier le render de l'action register du contrôleur;

### Structure des templates

Maintenant, modifions nos templates afin de mieux présenter notre espace utilisateur.

#### Webpack Encore

Nous allons utiliser Webpack Encore pour gérer plus efficacement le CSS et le Javascript de notre application.

Ça va nous donner un outil propre et puissant pour regrouper des modules JavaScript, CSS et JS et pour
compiler et minifier les assets.

Tout d'abord, assurez-vous que Node.js et Yarn sont installés sur votre machine.

Et ajouter le bundle webpack-encore:

``` console
composer require symfony/webpack-encore-bundle
```

Ajouter les packages suivant :

``` console    
yarn add node-sass sass-loader bootstrap @fortawesome/fontawesome-free @fortawesome/free-brands-svg-icons jquery popper.js --dev
```

Supprimer le fichier app.js dans le dossier assets/js/ et ajouter les deux fichiers suivants :

``` javascript
// assets/js/front_app.js

// css

import '../css/front_app.scss';

// js
const $ = require('jquery');
window.Popper = require('popper.js');
global.$ = global.jQuery = $;
require('bootstrap');
```

``` javascript
// assets/js/back_app.js

// css
import '../css/back_app.scss';

// js
const $ = require('jquery');
window.Popper = require('popper.js');
global.$ = global.jQuery = $;
require('bootstrap');
```

Même principe dans le dossier assets/css :

``` scss
// assets/css/front_app.scss

// font awesome
@import '~@fortawesome/fontawesome-free/scss/fontawesome';
@import '~@fortawesome/fontawesome-free/scss/regular';
@import '~@fortawesome/fontawesome-free/scss/solid';
@import '~@fortawesome/fontawesome-free/scss/brands';

// bootstrap
@import "~bootstrap/scss/bootstrap";

body {
    #flash_message {
        width: 100%;
        max-width: 320px;
        background-color: transparent;
        position: absolute;
        right: 15PX;
        top: 150px;
        z-index: 999;
    }
}
```

``` scss
// assets/css/back_app.scss

// font awesome
@import '~@fortawesome/fontawesome-free/scss/fontawesome';
@import '~@fortawesome/fontawesome-free/scss/regular';
@import '~@fortawesome/fontawesome-free/scss/solid';
@import '~@fortawesome/fontawesome-free/scss/brands';

// bootstrap
@import "~bootstrap/scss/bootstrap";


// global

$base-font-size: 14px;
$default-color: #ff8a00;
$default-color-hover:#fe9e08;
$default-color-auther:#111;
$default-color-text: #777;


body {

    .navbar {
        padding: 15px 10px;
        background: #fff;
        border: none;
        border-radius: 0;
        margin-bottom: 40px;
        box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
    }

    .navbar-btn {
        box-shadow: none;
        outline: none !important;
        border: none;
    }

    .line {
        width: 100%;
        height: 1px;
        border-bottom: 1px dashed #ddd;
        margin: 40px 0;
    }

    .btn {
        border-radius: 0;
    }

    .btn-info {
        background-color: $default-color;
        border-color: $default-color;
        &:hover{
            background-color: $default-color-hover;
            border-color: $default-color-hover;
        }
    }

    .btn-primary {
        background-color: $default-color;
        border-color: $default-color;
        &:hover{
            background-color: $default-color-hover;
            border-color: $default-color-hover;
        }
    }

    .wrapper {
        display: flex;
        width: 100%;
        align-items: stretch;
        overflow: hidden;
    }

    #sidebar {
        min-width: 250px;
        max-width: 250px;
        background: $default-color-auther;
        color: #fff;
        transition: all 0.3s;
    }

    #sidebar.active {
        margin-left: -250px;
    }

    #sidebar .sidebar-header {
        padding: 20px;
        background: $default-color;
    }

    #sidebar ul.components {
        padding: 20px 0;
        border-bottom: 1px solid $default-color;
    }

    #sidebar ul p {
        color: #fff;
        padding: 10px;
    }

    #sidebar ul li a {
        padding: 10px;
        font-size: rem(14);
        display: block;
        color: #fff;
    }

    #sidebar ul li a:hover {
        color: $default-color-auther;
        background: #fff;
        color: $default-color;
    }

    #sidebar ul li.active>a,
    a[aria-expanded="true"] {
        color: #fff;
        background: $default-color;
    }

    a[data-toggle="collapse"] {
        position: relative;
    }

    .dropdown-toggle::after {
        display: block;
        position: absolute;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
    }

    ul ul a {
        font-size: 0.9em !important;
        padding-left: 30px !important;
        background: $default-color;
    }
    
    a.article,
    a.article:hover {
        background: $default-color!important;
        color: #fff !important;
    }

    #flash_message {
        width: 100%;
        max-width: 320px;
        background-color: transparent;
        position: absolute;
        right: 15px;
        top: 150px;
        z-index: 999;
    }
}
```

Il faut également éditer le fichier webpack.config.js pour qu'il ressemble à celui-ci :

``` javascript
var Encore = require('@symfony/webpack-encore');

Encore
    // directory where compiled assets will be stored
    .setOutputPath('public/build/')
    // public path used by the web server to access the output path
    .setPublicPath('/build')

    .copyFiles({
        from: 'assets/img',
    
       // optional target path, relative to the output dir
        to: 'images/[name].[hash:8].[ext]',
        
        // if versioning is enabled, add the file hash too
        //to: 'images/[path][name].[hash:8].[ext]',
        // only copy files matching this pattern
        pattern: /\.(png|jpg|jpeg)$/
    })

    /*
     * ENTRY CONFIG
     *
     * Add 1 entry for each "page" of your app
     * (including one that's included on every page - e.g. "app")
     *
     * Each entry will result in one JavaScript file (e.g. app.js)
     * and one CSS file (e.g. app.css) if you JavaScript imports CSS.
     */
    .addEntry('back_app', './assets/js/back_app.js')
    .addEntry('front_app', './assets/js/front_app.js')
    
    // When enabled, Webpack "splits" your files into smaller pieces for greater optimization.
    .splitEntryChunks()

    // will require an extra script tag for runtime.js
    // but, you probably want this, unless you're building a single-page app
    .enableSingleRuntimeChunk()

    /*
     * FEATURE CONFIG
     *
     * Enable & configure other features below. For a full
     * list of features, see:
     * https://symfony.com/doc/current/frontend.html#adding-more-features
     */
    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    // enables hashed filenames (e.g. app.abc123.css)
    .enableVersioning(Encore.isProduction())

    // enables Sass/SCSS support
    .enableSassLoader()

    // uncomment if you're having problems with a jQuery plugin
    .autoProvidejQuery()
;

module.exports = Encore.getWebpackConfig();
```

La configuration de Webpack Encore est terminée et nous allons avoir une configuration pour le front et une autre pour le back de notre application afin d'avoir un visuel différent.

Il suffit de lancer une commande yarn pour générer le css et le js :

``` console
yarn encore dev
```

#### Base et layout twig

Voici maintenant le base.html.twig, le front/layout.html.twig et le back/layout.html.twig :

{% highlight twig %}
{% raw %} 
{# templates/base.html.twig #}
<!DOCTYPE html>
<html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0,shrink-to-fit=no">
        <meta name="author" content="Martin GILBERT">
        <title>{% block title %}{{ 'DevFusion' }}{% endblock %}</title>
        <meta name="description" content="{% block description %}{{ '' }}{% endblock %}" />
        <link rel="icon" type="image/png" href="{{ asset('build/images/favicon.png')}}" />
        {% block stylesheets %}{% endblock %}
    </head>
    {% block body %}{% endblock %}
</html>
{% endraw %} 
{% endhighlight %}

{% highlight twig %}
{% raw %} 
{# template/back/layout.html.twig #}
{% extends 'base.html.twig' %}

{% block stylesheets %}
    {{encore_entry_link_tags('back_app')}}
{% endblock %}

{% block body %}
    <body>
        {% block flash_message %}
            {% include "block/_flash_message.html.twig" %}
        {% endblock %}
        <div class="wrapper">
            {% block sidebar %}
                {% include "back/block/_sidebar.html.twig" %}
            {% endblock %}
            <div id="content">
                {% block navbar %}
                    {% include "back/block/_navbar.html.twig" %}
                {% endblock %}
                {% block content %}{% endblock %}
            </div>
        </div>
        {% block javascripts %}
            {{encore_entry_script_tags('back_app')}}
        {% endblock %}
    </body>
{% endblock %}
{% endraw %} 
{% endhighlight %}

{% highlight twig %}
{% raw %} 
{# template/front/layout.html.twig #}
{% extends 'base.html.twig' %}
{% block stylesheets %}
    {{ encore_entry_link_tags('front_app') }}
{% endblock %}

{% block body %}
    <body>
        {% block flash_message %}
            {% include "block/_flash_message.html.twig" %}
        {% endblock %}
        
        {% block navbar %}
            <div class="menu">
                <div class="container">
                    {% include "front/block/_navbar.html.twig" %}
                </div>
            </div>
        {% endblock %}

        {% block content %}
            {% block banner%}{% endblock %}
        {% endblock %}

        {% block footer %}
            {% include "front/block/_footer.html.twig" %}
        {% endblock %}

        {% block javascripts %}
            {{ encore_entry_script_tags('front_app') }}
        {% endblock %}
    </body>
{% endblock %}
{% endraw %} 
{% endhighlight %}

{% highlight twig %}
{% raw %} 
{# templates/block/_flash_message.html.twig #}
{% if app.request.hasPreviousSession %}
    {% set flashbag = app.session.flashbag.all() %}
    {% if flashbag|length %}
        <div id="flash_message" class="container">
            {% for type, messages in flashbag %}
                {% for message in messages %}
                    <div class="alert alert-{{ type }} alert-dismissible fade show" role="alert">
                        <span class="sr-only">{{ ('alert.' ~ type)|trans({}, 'message') }} : </span>{{ message|raw|nl2br }}
                        <button type="button" class="close" data-dismiss="alert" aria-label="{{ 'btn.close'|trans({}, 'message') }}">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                {% endfor %}
            {% endfor %}
        </div>
    {% endif %}
{% endif %}
{% endraw %} 
{% endhighlight %}

Vous pouvez pour l'instant, ajouter des fichiers vides pour les includes dans les répertoires back/block & front/block...

### Accueil Back et Front

Ajoutons un contrôleur Page avec une action index et un template dans le back et le front afin d'accueillir nos utilisateurs.

``` php
<?php

namespace App\Controller\Back;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/back")
 */
class PageController extends AbstractController
{
    /**
     * @Route("/", name="back_home")
     */
    public function index()
    {
        return $this->render('back/page/index.html.twig', [
            
        ]);
    }
}

```

``` php
<?php

namespace App\Controller\Front;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class PageController extends AbstractController
{
    /**
     * @Route("/", name="front_home")
     */
    public function index()
    {
        return $this->render('front/page/index.html.twig', [
            
        ]);
    }
}

```

{% highlight twig %}
{% raw %}
{# templates/back/page/index.html.twig #}
{% extends 'back/layout.html.twig' %}

{% block title %}{% endblock %}

{% block content %}
    <p>Page d'accueil back</p>
{% endblock %}
{% endraw %}
{% endhighlight %}

{% highlight twig %}
{% raw %}
{# templates/front/page/index.html.twig #}
{% extends 'front/layout.html.twig' %}

{% block title %}{% endblock %}

{% block content %}
    <p>Page d'accueil front</p>
    <p>{{ app.user.lastLoginAt|date() }}</p>
{% endblock %}
{% endraw %}
{% endhighlight %}

Notre structure Symfony est maintenant mieux divisée afin de facilement s'y retrouver.

Nous sommes maintenant prêts pour optimiser notre espace utilisateur.

## Modification de l'entité User

Nous allons ajouter quelques éléments à notre entité User afin de pouvoir par la suite implémenter de nouvelles fonctionnalités.

* Modification du message d'erreur de l'email unique par une constante de traduction registration.message.unique_email. (Je vous fournis les fichiers de traduction à la fin)
* Un champ firstname et un champ lastname de type string afin de mieux identifier nos utilisateurs;
* Un champ enabled de type boolean pour activer et désactiver le compte utilisateur;
* Un champ confirmationToken de type string afin d'identifier l'utilisateur pour contrôler l'email lors de l'inscription ou l'invitation et pour envoyer un courriel si l'utilisateur oublie son mot de passe;
* Un champ lastLoginAt de type DateTime;
* Un champ createdAt de type DateTime;
* Un champ updatedAt de type DateTime;
* Une méthode __toString pour convertir l'objet en chaîne de caractères;
* Une méthode setCreated liée à l'événement PrePersist de Doctrine;
* Une méthode setUpdated liée à l'événement PreUpdate de Doctrine;

Voici le résultat final :

``` php
<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @ORM\Entity(repositoryClass="App\Repository\UserRepository")
 * @UniqueEntity(fields={"email"}, message="registration.message.unique_email")
 * @ORM\HasLifecycleCallbacks()
 */
class User implements UserInterface
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=180, unique=true)
     */
    private $email;

    /**
     * @ORM\Column(type="json")
     */
    private $roles = [];

    /**
     * @var string The hashed password
     * @ORM\Column(type="string")
     */
    private $password;

    /**
     * @ORM\Column(type="boolean")
     */
    private $enabled;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $confirmationToken;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $firstname;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $lastname;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $lastLoginAt;

    /**
     * @ORM\Column(type="datetime")
     */
    private $createdAt;

    /**
     * @ORM\Column(type="datetime")
     */
    private $updatedAt;

    public function __toString()
    {
        return ucfirst($this->getFirstname())." ".mb_strtoupper($this->getLastname());
    }

    /**
     * @ORM\PrePersist
     */
    public function setCreated()
    {
        $this->setCreatedAt(new \DateTime());
        $this->setUpdatedAt(new \DateTime());
    }

    /**
     * @ORM\PreUpdate
     */
    public function setUpdated()
    {
        $this->setUpdatedAt(new \DateTime());
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUsername(): string
    {
        return (string) $this->email;
    }

    public function hasRole($role): bool
    {
        return in_array(strtoupper($role), $this->getRoles(), true);
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function getPassword(): string
    {
        return (string) $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function getSalt()
    {
        // not needed when using the "bcrypt" algorithm in security.yaml
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials()
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function isEnabled(): ?bool
    {
        return $this->enabled;
    }

    public function getEnabled(): ?bool
    {
        return $this->enabled;
    }

    public function setEnabled(bool $enabled): self
    {
        $this->enabled = $enabled;

        return $this;
    }

    public function getConfirmationToken(): ?string
    {
        return $this->confirmationToken;
    }

    public function setConfirmationToken(?string $confirmationToken): self
    {
        $this->confirmationToken = $confirmationToken;

        return $this;
    }

    public function getFirstname(): ?string
    {
        return $this->firstname;
    }

    public function setFirstname(?string $firstname): self
    {
        $this->firstname = $firstname;

        return $this;
    }

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function setLastname(?string $lastname): self
    {
        $this->lastname = $lastname;

        return $this;
    }

    public function getLastLoginAt(): ?\DateTimeInterface
    {
        return $this->lastLoginAt;
    }

    public function setLastLoginAt(?\DateTimeInterface $lastLoginAt): self
    {
        $this->lastLoginAt = $lastLoginAt;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }
}
``` 

Mettons à jour le schéma de base de données :
``` console
php bin/console doctrine:schema:update --force
```


## Amélioration du LoginFormAuthenticator

* Injection du composant de traduction afin de traduire les messages d'erreur;
* Injection de la session pour envoyer des messages flash;
* Ajout d'une erreur à la connexion si l'utilisateur n'est pas activé;
* Lors de la connexion redirection dans le back si l'utilisateur a le rôle admin;
* Mise à jour de la date de connexion de l'utilisateur;
* Ajout d'un message de bienvenue après la connexion;

Voici le résultat final :

``` php
<?php

namespace App\Security;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Core\Exception\InvalidCsrfTokenException;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Csrf\CsrfToken;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Security\Guard\Authenticator\AbstractFormLoginAuthenticator;
use Symfony\Component\Security\Http\Util\TargetPathTrait;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Translation\TranslatorInterface;

class LoginFormAuthenticator extends AbstractFormLoginAuthenticator
{
    use TargetPathTrait;

    private $entityManager;
    private $urlGenerator;
    private $csrfTokenManager;
    private $passwordEncoder;
    private $session;
    private $translator;

    public function __construct(EntityManagerInterface $entityManager, UrlGeneratorInterface $urlGenerator, CsrfTokenManagerInterface $csrfTokenManager, UserPasswordEncoderInterface $passwordEncoder, SessionInterface $session, TranslatorInterface $translator)
    {
        $this->entityManager = $entityManager;
        $this->urlGenerator = $urlGenerator;
        $this->csrfTokenManager = $csrfTokenManager;
        $this->passwordEncoder = $passwordEncoder;
        $this->session = $session;
        $this->translator = $translator;
    }

    public function supports(Request $request)
    {
        return 'app_login' === $request->attributes->get('_route')
            && $request->isMethod('POST');
    }

    public function getCredentials(Request $request)
    {
        $credentials = [
            'email' => $request->request->get('email'),
            'password' => $request->request->get('password'),
            'csrf_token' => $request->request->get('_csrf_token'),
        ];
        $request->getSession()->set(
            Security::LAST_USERNAME,
            $credentials['email']
        );

        return $credentials;
    }

    public function getUser($credentials, UserProviderInterface $userProvider)
    {
        $token = new CsrfToken('authenticate', $credentials['csrf_token']);
        if (!$this->csrfTokenManager->isTokenValid($token)) {
            throw new InvalidCsrfTokenException();
        }

        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $credentials['email']]);

        if (!$user) {
            // fail authentication with a custom error
            throw new CustomUserMessageAuthenticationException($this->translator->trans('login.message.email_not_found', [], 'security'));
        }

        if (!$user->isEnabled()) {
            throw new CustomUserMessageAuthenticationException($this->translator->trans('login.message.not_activated', [], 'security'));
        }

        return $user;
    }

    public function checkCredentials($credentials, UserInterface $user)
    {
        return $this->passwordEncoder->isPasswordValid($user, $credentials['password']);
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, $providerKey)
    {
        if ($targetPath = $this->getTargetPath($request->getSession(), $providerKey)) {
            return new RedirectResponse($targetPath);
        }

        $user = $token->getUser();
        
        $user->setLastLoginAt(new \DateTime());
        $this->entityManager->flush();
        
        $msg = $this->translator->trans('login.message.welcome', ['%user%' => $user ], 'security');
        $this->session->getFlashBag()->add('success', $msg);
        
        if ($user->hasRole('ROLE_ADMIN')) {
            return new RedirectResponse($this->urlGenerator->generate('back_home'));
        }
        return new RedirectResponse($this->urlGenerator->generate('front_home'));
    }

    protected function getLoginUrl()
    {
        return $this->urlGenerator->generate('app_login');
    }
}
```

## Amélioration de l'inscription

* Ajout de la traduction;
* Ajout de messages flash;
* Envoi d'un courriel pour valider l'adresse mail de l'utilisateur

### Ajout de paramètres

Pour définir les informations du site web, nous allons ajouter des paramètres dans le fichier services.yaml:

``` yaml
parameters:
    configuration:
        name: "DevFusion"
        from_email: no-reply@dev-fusion.com
        to_email: martin.gilbert@dev-fusion.com
```

### Envoi de l'email de confirmation avec SwiftMailer

Ajoutons une classe pour gérer l'envoi de mail:

``` php
<?php
namespace App\Mailer;

use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Templating\EngineInterface;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use App\Entity\User;
use App\Repository\UserRepository;

class Mailer
{
    
    /**
     * @var MailerInterface
     */
    protected $mailer;
    
    /**
     * @var UrlGeneratorInterface
     */
    protected $router;
    
    /**
     * @var EngineInterface
     */
    protected $templating;
    
    /**
     * @var TranslatorInterface
     */
    protected $translator;
    
    /**
     * @var ParameterBagInterface
     */
    protected $parameters;
    
    /**
     * Mailer constructor.
     *
     */
    public function __construct(\Swift_Mailer $mailer, UrlGeneratorInterface $router, EngineInterface $templating, TranslatorInterface $translator, ParameterBagInterface $parameters)
    {
        $this->mailer = $mailer;
        $this->router = $router;
        $this->templating = $templating;
        $this->translator = $translator;
        $this->parameters = $parameters;
    }
    
    public function sendRegistration(User $user)
    {
        $url = $this->router->generate(
            'app_registration_confirm',
            [
                'token' => $user->getConfirmationToken(),
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
        $subject = $this->translator->trans('registration.email.subject', [ '%user%' => $user ], 'security');
        $template = 'front/email/register.html.twig';
        $from = [
            $this->parameters->get('configuration.')['from_email'] => $this->parameters->get('configuration')['name'],
        ];
        $to = $user->getEmail();
        $body = $this->templating->render($template, [
            'user' => $user,
            'website_name' => $this->parameters->get('configuration')['name'],
            'confirmation_url' => $url,
        ]);
        $message = (new \Swift_Message())
            ->setSubject($subject)
            ->setFrom($from)
            ->setTo($to)
            ->setContentType("text/html")
            ->setBody($body);
        $this->mailer->send($message);
    }
}

```

Il faut configurer le moteur de template pour injecter twig dans le service mailer.

Exécuter cette commande:
``` console
composer require symfony/templating
```
    
Et dans le fichier framework.yaml ajouter cette ligne :

{% highlight yaml %}
{% raw %} 
framework:
    templating: { engines: ['twig'] }
{% endraw %}
{% endhighlight %}

Et maintenant le template de l'email d'inscription

{% highlight twig %}
{% raw %} 
{# templates/front/email/register.html.twig #}
{{ 'registration.email.message'|trans({
        '%user%': user,
        '%confirmation_url%': confirmation_url,
        '%host%': app.request.schemeAndHttpHost,
        '%website_name%': website_name
    }, 'security')|raw|nl2br
}}
{% endraw %}
{% endhighlight %}

Il ne reste plus qu'à créer le texte de l'email dans le fichier de traduction.

### Le RegistrationController

``` php
<?php

namespace App\Controller\Front;

use App\Entity\User;
use App\Form\Front\RegistrationFormType;
use App\Mailer\Mailer;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Translation\TranslatorInterface;

class RegistrationController extends AbstractController
{

    /**
     * @var TranslatorInterface
     */
    private $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }
    
    /**
     * @Route("/register", name="front_register")
     */
    public function register(Request $request, UserPasswordEncoderInterface $passwordEncoder, Mailer $mailer): Response
    {
        $user = new User();
        $form = $this->createForm(RegistrationFormType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // encode the plain password
            $user->setPassword(
                $passwordEncoder->encodePassword(
                    $user,
                    $form->get('plainPassword')->getData()
                )
            );

            $user->setEnabled(false);
            $user->setConfirmationToken(random_bytes(24));
            $user->setLastLoginAt(new \DateTime());
            
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($user);
            $entityManager->flush();

            $mailer->sendRegistration($user);

            $msg = $this->translator->trans('registration.flash.check_email', [ '%email%' => $user->getEmail(), ], 'security');
            $this->addFlash('info', $msg);

            return $this->redirectToRoute('app_login');
        }

        return $this->render('front/registration/register.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}

```

### Le formulaire d'inscription

``` php
<?php

namespace App\Form\Front;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\IsTrue;

class RegistrationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('email', EmailType::class, [
                'label' => 'registration.label.email',
            ])
            ->add('firstname', TextType::class, [
                'label' => 'registration.label.firstname',
            ])
            ->add('lastname', TextType::class, [
                'label' => 'registration.label.lastname',
            ])
            ->add('plainPassword', RepeatedType::class, [
                'type' => PasswordType::class,
                'invalid_message' => 'registration.message.repeated_password_invalid',
                'options' => ['attr' => ['class' => 'password-field']],
                'required' => true,
                'first_options'  => ['label' => 'registration.label.password'],
                'second_options' => ['label' => 'registration.label.repeat_password'],
                // instead of being set onto the object directly,
                // this is read and encoded in the controller
                'mapped' => false,
                'constraints' => [
                    new NotBlank([
                        'message' => 'registration.message.password_not_blank',
                    ]),
                    new Length([
                        'min' => 6,
                        'minMessage' => 'registration.message.password_length_min',
                        // max length allowed by Symfony for security reasons
                        'max' => 4096,
                    ]),
                ],
            ])
            ->add('agreeTerms', CheckboxType::class, [
                'label' => 'registration.label.agree_terms',
                'mapped' => false,
                'constraints' => [
                    new IsTrue([
                        'message' => 'registration.message.agree_terms_is_true',
                    ]),
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => User::class,
            'translation_domain' => 'security',
        ]);
    }
}

```

### La vue d'inscription

{% highlight twig %}
{% raw %}
{# templates/front/registration/register.html.twig #}
{% trans_default_domain 'security' %}
{% extends 'front/layout.html.twig' %}

{% block title %}{{ 'registration.title'|trans() }}{% endblock %}

{% block content %}
<section class="pt-4 pb-4">
    <div class="container">
        <div class="col-lg-6 mx-auto">
            <div class="card mt-4 mb-4">
                <div class="card-body">
                    {{ form_start(form) }}
                        <h1 class="h3 mb-3 font-weight-normal">{{ 'registration.h1'|trans() }}</h1>
                        {{ form_row(form.email) }}
                        {{ form_row(form.firstname) }}
                        {{ form_row(form.lastname) }}
                        {{ form_row(form.plainPassword) }}
                        {{ form_row(form.agreeTerms) }}
                        <div class="form-group text-center">
                            <button class="btn btn-primary btn-block" type="submit">
                                {{ 'registration.btn.submit'|trans() }}
                            </button>
                        </div>
                    {{ form_end(form) }}
                </div>
            </div>
        </div>
    </div>
</section>
{% endblock %}
{% endraw %}
{% endhighlight %}

Pour améliorer la vue de nos formulaires nous pouvons ajouter le thème Bootstrap4:

``` yaml
# config/packages/twig.yaml
twig:
    ...
    form_themes: ['bootstrap_4_layout.html.twig']
```

### La confirmation du compte

Une fois l'email envoyé avec le token de confirmation, il faut créer une action de contrôleur pour activer l'utilisateur.

Nous allons donc ajouter une méthode registrationConfirm dans le contrôleur SecurityController dans laquelle nous allons :

* Récupérer le token de la requête;
* Rechercher l'utilisateur à partir du token;
* Si l'utilisateur n'existe pas, on retourne un statut 404;
* On set le token de l'utilisateur à null pour qu'il ne soit pas réutilisé, on active l'utilisateur et on le flush avec Doctrine;
* On envoie un message flash pour indiquer que le compte a bien été activé.
* Et finalement, on connecte l'utilisateur et on le redirige en déclenchant l'événement authenticateUserAndHandleSuccess;

Voici l'état de notre contrôleur:

``` php
<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\ForgetPasswordFormType;
use App\Form\ResetPasswordFormType;
use App\Mailer\Mailer;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Authentication\Provider\UserAuthenticationProvider;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Symfony\Component\Security\Core\Exception\LogicException;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Guard\GuardAuthenticatorHandler;
use App\Security\LoginFormAuthenticator;

class SecurityController extends AbstractController
{

    /**
     * @var TranslatorInterface
     */
    private $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }
    
    /**
     * @Route("/login", name="app_login")
     */
    public function login(AuthenticationUtils $authenticationUtils): Response
    {
        // if ($this->getUser()) {
        //    $this->redirectToRoute('target_path');
        // }

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();
        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('security/login.html.twig', ['last_username' => $lastUsername, 'error' => $error]);
    }

    /**
     * @Route("/logout", name="app_logout")
     */
    public function logout()
    {
        throw new \Exception('This method can be blank - it will be intercepted by the logout key on your firewall');
    }

    /**
     * @Route("/registration_confirm", name="app_registration_confirm")
     */
    public function registrationConfirm(Request $request, UserRepository $userRepository, GuardAuthenticatorHandler $guardHandler, LoginFormAuthenticator $authenticator): Response
    {
        $token = $request->query->get('token');
        $user = $userRepository->findOneByConfirmationToken($token);
        if (null === $user) {
            throw $this->createNotFoundException(sprintf('The user with confirmation token "%s" does not exist', $token));
        }
        
        $user->setConfirmationToken(null);
        $user->setEnabled(true);
        $this->getDoctrine()->getManager()->flush();
        
        $msg = $this->translator->trans('registration.flash.confirmed', [ '%user%' => $user, ], 'security');
        $this->addFlash('success', $msg);
        
        return $guardHandler->authenticateUserAndHandleSuccess(
            $user,
            $request,
            $authenticator,
            'main' // firewall name in security.yaml
        );
    }
}

```

Et voilà, tout est réglé concernant la vérification de l'adresse email.

## J'ai oublié mon mot de passe

Au nombre de mot de passe dont on doit se souvenir pour chacun des services qu'on utilise au quotidien, il est normal d'en oublier un une fois de temps en temps. C'est donc une fonctionnalité indispensable.

Nous allons créer une page dans laquelle l'utilisateur pourra entrer son email. À la soumission de ce formulaire, un mail lui sera envoyé dans lequel il y aura un lien avec un token pour qu'il puisse réinitialiser son mot de passe.

La page de réinitialisation aura un double usage:

* Les utilisateurs ayant oublié leur mot de passe qui vont donc s'identifier avec un token reçu par mail;
* Les utilisateurs voulant simplement changer leur mot de passe pour une raison de sécurité qui vont devoir entrer leur ancien mot de passe;

### Identification avec un token

Nous allons ajouter une action forgetPassword dans le contrôleur Security:

``` php
    /**
     * @Route("/forget_password", name="app_forget_password")
     */
    public function forgetPassword(Request $request, UserRepository $userRepository, Mailer $mailer): Response
    {
        $form = $this->createForm(ForgetPasswordFormType::class);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $user = $userRepository->findOneByEmail($form->get('email')->getData());
            if ($user) {
                $user->setConfirmationToken(random_bytes(24));
                $this->getDoctrine()->getManager()->flush();
                $mailer->sendForgetPassword($user);
                $msg = $this->translator->trans('forget_password.flash.check_email', [ '%user%' => $user, ], 'security');
                $this->addFlash('success', $msg);
            }
            return $this->redirectToRoute('front_home');
        }
        return $this->render('security/forget_password.html.twig', [
            'form' => $form->createView(),
        ]);
    }
```

Cette action reste simple :

* On crée un formulaire pour inscrire l'adresse email;
* On recherche l'utilisateur à partir de son email;
* S'il existe, ajout d'un token, envoie de l'email et ajout d'un message flash;
* Sinon, on ne fait rien du tout;
* Et redirection sur la page d'accueil;

Les templates, le formulaire, et l'envoie de l'email est trop simple pour que je vous montre le code. C'est exactement comme pour l'inscription.

## Réinitialisation du mot de passe

Lorsqu'un utilisateur est connecté, il peut redéfinir son mot de passe.

Voici l'action du contrôleur permettant de le faire. J'explique le fonctionnement juste après.

``` php
    /**
     * @Route("/reset_password/{id}", defaults={"id"=null}, name="app_reset_password")
     */
    public function resetPassword(
        Request $request,
        UserRepository $userRepository,
        UserPasswordEncoderInterface $passwordEncoder,
        GuardAuthenticatorHandler $guardHandler,
        LoginFormAuthenticator $authenticator,
        User $user=null
    ): response {
        if ($token = $request->query->get('token')) {
            $user = $userRepository->findOneByConfirmationToken($token);
            if (!$user) { throw $this->createNotFoundException(sprintf('The user with confirmation token "%s" does not exist', $token)); }
        } elseif (!$user) { throw new LogicException("No user selected."); }
        $form = $this->createForm(ResetPasswordFormType::class, null, [
            'with_token' => null !== $token,
        ]);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $user->setPassword($passwordEncoder->encodePassword($user, $form->get('plainPassword')->getData()));
            if ($token) {
                $user->setConfirmationToken(null);
            }
            $this->getDoctrine()->getManager()->flush();
            $msg = $this->translator->trans('reset_password.flash.success', [], 'security');
            $this->addFlash('info', $msg);
            return $guardHandler->authenticateUserAndHandleSuccess($user, $request, $authenticator, 'main');
        }
        return $this->render('security/reset_password.html.twig', [
            'form' => $form->createView(),
        ]);
    }
```

Cette action est un peu longue. Il faut dire qu'elle a deux rôles. Redéfinir le mot de passe d'un utilisateur connecté ou d'un utilisateur ayant oublié son mot de passe avec un token reçu par mail.

Tout d'abord l'id dans la route est facultatif, car l'utilisateur peut également être récupéré avec un token dans le cas d'un oubli de mot de passe.

S'il y a un token, on essaie de récupérer l'utilisateur à partir de celui-ci, mais s'il n'y a aucune correspondance, on n'oublie pas de déclencher une erreur 404. 

S'il n'y a pas de token et que la variable $user est nulle, on déclenche une LogicException.

De cette manière, on s'assure que pour la suite la variable $user est initialisée soit par le ParamConverter ou par la méthode magique findOneByConfirmationToken du repository.

Ensuite, on crée un formulaire en spécifiant l'option with_token pour préciser s'il faut demander l'ancien mot de passe ou pas.

Si c'est une requête POST et que le formulaire est valide :

* On encode le nouveau mot de passe et on remplace l'ancien par celui-ci;
* On supprime le token de confirmation si c'est une identification envoyée par e-mail;
* On enregistre les modifications dans la base de données;
* On ajoute un message flash pour confirmer que tout c'est bien passé;
* On connecte l'utilisateur avec le GuardHandler et s'il l'était déjà, il sera simplement redirigé au bonne endroit.

Et sinon, on renvoie une réponse avec la vue security/reset_password.html.twig comme contenu.

Le formulaire se présente ainsi:

``` php
<?php

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\Validator\Constraints\UserPassword;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Length;

class ResetPasswordFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if (!$options['with_token']) {
            $builder
                ->add('password', PasswordType::class, [
                    'label' => 'reset_password.label.current_password',
                    'constraints' => [
                        new NotBlank([
                            'message' => 'registration.message.not_blank',
                        ]),
                        new Length([
                            'min' => 6,
                            'minMessage' => 'registration.message.password_length_min',
                            // max length allowed by Symfony for security reasons
                            'max' => 4096,
                        ]),
                        new UserPassword([
                            'message' => 'reset_password.message.current_password_wrong',
                        ])
                    ],
                ])
            ;
        }
        $builder
            ->add('plainPassword', RepeatedType::class, [
                'type' => PasswordType::class,
                'invalid_message' => 'reset_password.message.repeated_new_password_invalid',
                'options' => ['attr' => ['class' => 'password-field']],
                'required' => true,
                'first_options'  => ['label' => 'reset_password.label.new_password'],
                'second_options' => ['label' => 'reset_password.label.repeat_new_password'],
                // instead of being set onto the object directly,
                // this is read and encoded in the controller
                'mapped' => false,
                'constraints' => [
                    new NotBlank([
                        'message' => 'registration.message.password_not_blank',
                    ]),
                    new Length([
                        'min' => 6,
                        'minMessage' => 'registration.message.password_length_min',
                        // max length allowed by Symfony for security reasons
                        'max' => 4096,
                    ]),
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'with_token' => false,
            'translation_domain' => 'security',
        ]);
    }
}
```

Et finalement la vue du formulaire :

{% highlight twig %}
{% raw %}
{# templates/security/reset_password.html.twig #}
{% trans_default_domain 'security' %}
{% extends 'front/layout.html.twig' %}

{% block title %}{{ 'reset_password.title'|trans() }}{% endblock %}

{% block content %}
<section class="pt-4 pb-4">
    <div class="container">
        <div class="col-lg-6 mx-auto">
            <div class="card mt-4 mb-4">
                <div class="card-body">
                    {{ form_start(form) }}
                        <h1 class="h3 mb-3 font-weight-normal">{{ 'reset_password.h1'|trans() }}</h1>
                        {% if form.password is defined %}
                            {{ form_row(form.password) }}
                        {% endif %}
                        {{ form_row(form.plainPassword) }}
                        <div class="form-group text-center">
                            <button class="btn btn-primary btn-block" type="submit">
                                {{ 'reset_password.btn.submit'|trans() }}
                            </button>
                        </div>
                    {{ form_end(form) }}
                </div>
            </div>
        </div>
    </div>
</section>
{% endblock %}
{% endraw %}
{% endhighlight %}

## Le formulaire de login et le menu

Nous avons presque terminé, il nous manque juste une petite fonctionnalité.

Une fois qu'un utilisateur est authentifié, les informations d'identification sont stockées dans la session. À la fin de celle-ci, il est déconnecté et il doit fournir à nouveau ses identifiants la prochaine fois qu'il souhaite accéder à l'application.

L'équipe de Symfony a encore pensé à tout pour nous. Il est possible de créer facilement une case à cocher dans le formulaire de login pour rester connecté. Un token sera stocker dans les cookies de l'utilisateur pour qu'il puisse se connecter automatiquement à son retour.

Il suffit d'ajouter l'option  remember_me dans le firewalk:

``` yaml
# config/packages/security.yaml
security:
    # ...

    firewalls:
        main:
            # ...
            remember_me:
                secret:   '%kernel.secret%'
                lifetime: 604800 # 1 week in seconds
                path:     /
                #always_remember_me: true
```

Et voici ce que nous donne au final notre formulaire de login :

{% highlight twig %}
{% raw %}
{# templates/security/login.html.twig #}
{% trans_default_domain 'security' %}
{% extends 'front/layout.html.twig' %}

{% block title %}{{ 'login.title'|trans() }}{% endblock %}

{% block content %}
<section class="pt-4 pb-4">
    <div class="container">
        {% if error %}
            <div class="fadeInDown animated">
                <div class="alert alert-danger">{{ error.messageKey|trans(error.messageData, 'security') }}</div>
            </div>
        {% endif %}
        <div class="col-lg-6 mx-auto">
            <div class="card mt-4 mb-4">
                <div class="card-body">
                    <form method="post">
                        {% if app.user %}
                            <div class="mb-3">
                                {{ 'login.message.logged_as'|trans({ '%user%': app.user }) }}, <a href="{{ path('app_logout') }}">{{ 'login.link.logout'|trans() }}</a>
                            </div>
                        {% else %}
                            <h1 class="h3 mb-3 font-weight-normal">{{ 'login.h1'|trans() }}</h1>
                            <label for="inputEmail" class="sr-only">{{ 'login.label.email'|trans() }}</label>
                            <input type="email" value="{{ last_username }}" name="email" id="inputEmail" class="form-control mb-2" placeholder="{{ 'login.label.email'|trans() }}" required>
                            <label for="inputPassword" class="sr-only">{{ 'login.label.password'|trans() }}</label>
                            <input type="password" name="password" id="inputPassword" class="form-control" placeholder="{{ 'login.label.password'|trans() }}" required>

                            <input type="hidden" name="_csrf_token"
                                value="{{ csrf_token('authenticate') }}"
                            >
                            <div class="checkbox mb-3">
                                <label>
                                    <input type="checkbox" name="_remember_me"> {{ 'login.label.remember_me'|trans() }}
                                </label>
                            </div>
                            <div class="form-group text-center">
                                <button class="btn btn-primary btn-block" type="submit">
                                    {{ 'login.btn.submit'|trans() }}
                                </button>
                            </div>
                            <hr>
                            <div class="row">
                                <div class="col-sm-6">
                                    <a href="{{ path('app_forget_password') }}" class="btn btn-default btn-block btn-sm">{{ 'login.link.forget_password'|trans() }}</a>
                                </div>
                                <div class="col-sm-6">
                                    <a href="{{ path('front_register')}}" class="btn btn-default btn-block btn-sm"><i class="fas fa-user"></i> {{ 'login.link.registration'|trans() }}</a>
                                </div>
                            </div>
                        {% endif %}
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
{% endblock %}
{% endraw %}
{% endhighlight %}

Maintenant que nous avons implémenté toutes les fonctionnalités, nous pouvons ajouter le menu de navigation dans le front :

{% highlight twig %}
{% raw %}
{# templates/front/block/_navbar.html.twig #}
{% trans_default_domain 'front_message' %}
{% set route = app.request.get('_route') %}
<div class="navbar navbar-expand-md navbar-dark bg-dark mb-4" role="navigation">
    <a class="navbar-brand" href="#">DevFusion</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarCollapse">
        <ul class="navbar-nav mr-auto">
            <li class="nav-item{{ route == 'front_home' ? ' active' }}">
                <a class="nav-link" href="#">{{ 'nav.home'|trans() }}</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="" target="_blank">Github</a>
            </li>
            {% if app.user %}
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" id="dropdown_account" 
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                    >
                        <i class="fas fa-user"></i> {{ 'nav.account'|trans() }}
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="dropdown_account">
                        {% if is_granted("ROLE_ADMIN") %}
                            <li class="dropdown-item">
                                <a href="{{ path('back_home') }}">
                                    <i class="fas fa-user-cog"></i> {{ 'nav.account_admin'|trans() }}
                                </a>
                            </li>
                        {% else %}
                            <li class="dropdown-item">
                                <a href="#">
                                    <i class="fas fa-user-cog"></i> {{ 'nav.account_profile'|trans() }}
                                </a>
                            </li>
                        {% endif %}
                        <li class="dropdown-item{{ route == 'app_reset_password' ? ' active' }}">
                            <a href="{{ path('app_reset_password', { 'id': app.user.id }) }}">
                                <i class="fas fa-"></i> {{ 'nav.account_reset_password'|trans() }}
                            </a>
                        </li>
                        <li class="dropdown-item">
                            <a href="{{ path('app_logout') }}">
                                <i class="fas fa-sign-out-alt"></i> {{ 'nav.account_logout'|trans() }}
                            </a>
                        </li>
                    </ul>
                </li>
            {% else %}
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" id="dropdown_account" 
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                    >
                        <i class="fas fa-user"></i> {{ 'nav.account'|trans() }}
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="dropdown_account">
                        <li class="dropdown-item{{ route == 'app_login' ? ' active' }}">
                            <a href="{{ path('app_login') }}">
                                <i class="fas fa-sign-in-alt"></i> {{ 'nav.account_login'|trans() }}
                            </a>
                        </li>
                        <li class="dropdown-item{{ route == 'front_register' ? ' active' }}">
                            <a href="{{ path('front_register') }}">
                                <i class="fas fa-user"></i> {{ 'nav.account_register'|trans() }}
                            </a>
                        </li>
                    </ul>
                </li>
            {% endif %}
        </ul>
    </div>
</div>
{% endraw %}
{% endhighlight %}

## En conclusion

Nous avons finalement un espace utilisateur complet et fonctionnel. Grâce au symfony/maker-bundle, nous avons généré une bonne partie de l'application ce qui nous a grandement facilité la vie.

Vous pouvez retrouver les fichiers de traduction et tous les fichiers que je vous ai présentés dans [le repository Github du projet].

Il manque seulement la gestion des utilisateurs du côté back-office. Nous allons voir cela dans un prochain tutoriel qui devrait venir rapidement. Ça ne devrait pas être très compliqué, car nous allons utiliser le devfusion/maker-bundle pour générer 90 % du code.

En espérant que tout cela vous sera utile.

Si vous rencontrer des bogues, des erreurs ou si vous avez des commentaires, vous pouvez m'en faire part à l'adresse martin.gilbert@dev-fusion.com.

[le repository Github du projet]: https://github.com/official-dev-fusion/dev-fusion-skeleton-user