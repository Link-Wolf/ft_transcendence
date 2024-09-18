<div id="top"></div>

<div align="center">
 <a href="https://github.com/Link-Wolf/ft_transcendence" title="Go to GitHub repo"><img src="https://img.shields.io/static/v1?label=Link-Wolf&message=ft_transcendence&color=blue&logo=github&style=for-the-badge" alt="Link-Wolf - ft_transcendence"></a>
 <a href="https://"><img src="https://img.shields.io/badge/42_grade-100_%2F_100-brightgreen?style=for-the-badge" alt="42 grade - 100 / 100"></a>
 <a href="https://"><img src="https://img.shields.io/badge/Year-2023-ffad9b?style=for-the-badge" alt="Year - 2023"></a>
 <a href="https://github.com/Link-Wolf/ft_transcendence/stargazers"><img src="https://img.shields.io/github/stars/Link-Wolf/ft_transcendence?style=for-the-badge&color=yellow" alt="stars - ft_transcendence"></a>
 <a href="https://github.com/Link-Wolf/ft_transcendence/network/members"><img src="https://img.shields.io/github/forks/Link-Wolf/ft_transcendence?style=for-the-badge&color=lightgray" alt="forks - ft_transcendence"></a>
 <a href="https://github.com/Link-Wolf/ft_transcendence/issues"><img src="https://img.shields.io/github/issues/Link-Wolf/ft_transcendence?style=for-the-badge&color=orange" alt="issues - ft_transcendence"></a>
 <a href="https://nodejs.org/en" title="Go to NodeJS homepage"><img src="https://img.shields.io/badge/Node.js-^20.2.0-blue?logo=node.js&logoColor=white&style=for-the-badge&color=719960" alt="Package - NodeJS"></a>
 <a href="https://react.dev/" title="Go to React homepage"><img src="https://img.shields.io/badge/React-^18.2.0-blue?logo=react&logoColor=white&style=for-the-badge&color=80D1EF" alt="Package - React"></a>
  <a href="https://www.postgresql.org/" title="Go to Postgresql homepage"><img src="https://img.shields.io/badge/PostgreSQL-^14.8-blue?logo=postgresql&logoColor=white&style=for-the-badge&color=3F6388" alt="DB - PostgreSQL"></a>
 <a href="https://www.linux.org/" title="Go to Linux homepage"><img src="https://img.shields.io/badge/OS-linux-blue?logo=linux&logoColor=white&style=for-the-badge&color=9E59B4" alt="OS - linux"></a>
</div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a>
    <img src="docs/assets/42mulhouse.svg" alt="Logo" width="192" height="80">
  </a>

  <h3 align="center">ft_transcendence</h3>

  <p align="center">
   <em>Soon, you will realize that you already know things
that you thought you didn’t</em><br/>
    A fullstack typescript web app to play pong online in multiplayer with a tchat and some others features  (ft. <a href="https://github.com/sur4c1">iCARUS</a> and <a href="https://github.com/Firencio">Firencio</a>)
    <br />
    <br />
    <a href="https://github.com/Link-Wolf/ft_transcendence/issues">Report Bug</a>
    ·
    <a href="https://github.com/Link-Wolf/ft_transcendence/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

<div align="center">
  <a>
    <img src="docs/assets/preview.gif" alt="preview of our website">
  </a>
</div>
</br>
This project aims to create a website to play Pong. It's a group project i made with <a href="https://github.com/sur4c1">iCARUS</a> and <a href="https://github.com/Firencio">Firencio</a>.
It requires us to develop a full web app complaining with the following technicals constraints:

-   Write the back-end of the website in NestJS
-   Write the front-end of the website in a typescript framework (we chose React)
-   Use the latest stable version of any library or framework used
-   Use a PostgreSQL database and no other database
-   The website must be a single page application
-   The website must be compatible with the latest version of Chrome and one other browser of our choice
-   Users should not encounter any error or warning when browsing the website
-   Everything has to be launched by a single call to `docker-compose up --build`
-   Any password must be **hashed** in the database
-   The website must be protected against SQL injections

As for the features, we had to implement a Chat in addition to the Pong game. It includes channels management (bans, mutes, kick, admins), private messages, a list of users and other classics chat features.

A user account is required to play Pong. It can only be created by connecting to the website with the OAuth system of 42 Intranet. It is then defined by their login, a unique name they can choose, same for their avatar, and an optionnal two-factor authentication.
All their infos, relationships (friends and blocked users) and stats related to the game are accessible for them on their profile page.

For the game itself a player is able to create a game and wait in a queue for another player to join.
Or it can also see which games are available and join one of them, only by seeing the game specifications without knowing who is the other player.
We implemented a classic and faithful Pong game, but also add differents maps and modifiers such as an increased or decreased paddle size, a ball that accelerate over time, or a fun mode where bonuses are randomly spawned on the map that can be picked up by the players to get a random effect (from a bonus to a malus or even a ball multiplication).

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

You shouldn't need a lot of things to run the project but be sure to follow the instructions below.

### Prerequisites

Having docker and docker-compose installed on your machine is the only requirement.

### Installation

1. Clone the repo

    ```sh
    git clone https://github.com/Link-Wolf/ft_transcendence.git
    ```

2. Duplicate and fill the .env file

    ```sh
    cd ft_transcendence
    cp .template.env .env
    [vim/nano/code] .env
    ```

3. Then launch the project

    ```sh
    cd ft_transcendence; make
    ```

4. Now you could access the website at the address and port you specified in the .env file

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

The website is pretty intuitive and easy to use.
Some effort has been made to make it as user-friendly as possible with our poor skills in front-end development.
Use our Pong website to play with your friends, chat with them, and have fun testing it!

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>
