---
layout: default
---
<main role="main">
  <div class="banner">
    <div class="container">
      <div class="bg-black"></div>
        <div class="middle">
            <h1 class="text-white">DEVFUSION</h1>
            <div class="shape white center"></div>
            <h2 class="h5 text-white">
              Site d’un développeur Symfony pour partager réflexions, découvertes, 
              développements personnels et petits tutoriels.
            </h2>
        </div>
    </div>
  </div>
  <section class="section-padding">
    <div class="container">
        <div class="row">
            <div class="col-lg-8">
              <h2>Bundle Symfony devfusion/maker-bundle</h2>
              <div class="shape left"></div>
              <div class="text-justify">
                <p>Ce bundle est un outil de génération de code. Il s'inspire du symfony/maker-bundle en ajoutant plusieurs fonctionnalités et plus de flexibilité.</p>
                <p>Il a été conçu pour générer un code facilement adaptable respectant une philosophie SCRUD (recherche, création, lecture, mise à jour et suppression) à partir d'une entité Doctrine.</p>
                <p>La commande df:make:config génère un fichier de configuration basé sur une entité donnée située dans App/Entity. Ce fichier sera utilisé ultérieurement pour générer le code. Le fichier doit être personnalisé pour générer le code attendu.</p>
                <p>La commande df:make:scrud génère un contrôleur avancé à partir d'un fichier de configuration situé dans config/scrud. Ce contrôleur vous permet d'effectuer les cinq opérations de base.</p>
              </div>
              <h3>Fonctionnalités</h3>
              <div class="shape left"></div>
              <ul class="list-unstyled text-justify">
                  <li>Extraction des chaînes de la vue et génération de fichiers de traduction;</li>
                  <li>Capacité de personnaliser le fichier de traduction généré dans la langue locale;</li>
                  <li>Capacité de remplacer les modèles squelettes pour générer du code personnalisé;</li>
                  <li>Capacité de créer plusieurs squelettes et choisir dans le fichier de configuration celui qui sera utilisé pour générer le code;</li>
                  <li>Les squelettes par défaut utilisent Bootstrap4 et JQuery dans les vues générées pour améliorer l'expérience visuelle;</li>
                  <li>Configuration d'un sous-dossier pour séparer correctement le code généré (Exemple : Controller/Back et Controller/Front);</li>
                  <li>Configuration d'une sous-route pour séparer les différentes parties de l'application (Exemple : admin/user/read);</li>
                  <li>Possibilité de générer un Voter pour gérer l'accès à chacune des actions SCRUD en fonction du rôle de l'utilisateur;</li>
                  <li>Capacité de choisir les actions SCRUD qui seront générées. Seule l'action de recherche est nécessaire;</li>
                  <li>Capacité de générer un filtre pour rechercher dans chacune des chaînes ou attributs de texte de l'entité;</li>
                  <li>Capacité de générer une pagination dans laquelle l'utilisateur peut modifier le nombre d'éléments par page directement dans le filtre de recherche;</li>
                  <li>Possibilité de générer un formulaire permettant de sélectionner plusieurs éléments en même temps afin de lancer plusieurs actions (Exemple : suppression de plusieurs éléments à la fois);</li>
                  <li>Génération d'un gestionnaire d'entité pour mieux structurer le code généré;</li>
              </ul>
              <a class="btn btn-default btn-block" href="https://packagist.org/packages/devfusion/maker-bundle" role="button">Packagist</a>
            </div>
            <div class="col-lg-4">
              <div class="jumbotron">
                <h2 class="h3">Les derniers articles</h2>
                 <div class="shape left"></div>
                <ul class="list-unstyled post-list">
                  {% for post in site.posts limit:3 %}
                    <li class="text-justify">
                      <h3 class="h5">{{ post.title }}</h3>
                      <hr>
                      <span class="post-meta"><i class="far fa-calendar-minus"></i> {{ post.date | date: "%d/%m/%Y"  }}</span>
                      <hr>
                      <p>{{ post.content | strip_html | truncatewords: 50 }}</p>
                      <a href="{{ post.url }}" class="btn btn-default btn-block" role="button">Lire la suite</a>
                    </li>
                  {% endfor %}
                </ul>
              </div>
            </div>
        </div>
    </div>
  </section>
</main>