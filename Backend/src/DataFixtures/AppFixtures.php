<?php

// src/DataFixtures/AppFixtures.php
namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\Post;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Array für späteres Referenzieren
        $users = [];

        // 3 Test-User erstellen
        for ($i = 1; $i <= 3; $i++) {
            $user = new User();
            $user->setUsername("testuser$i");
            $hashedPassword = $this->passwordHasher->hashPassword($user, "password123");
            $user->setPassword($hashedPassword);

            $manager->persist($user);
            $users[] = $user;
        }

        $manager->flush(); // User müssen zuerst in DB sein

        // Für jeden User 2-3 Posts erstellen
        foreach ($users as $user) {
            for ($j = 1; $j <= 3; $j++) {
                $post = new Post();
                $post->setTitle("Post $j von {$user->getUsername()}");
                $post->setContent("<p>Das ist ein Test-Post Nr. $j von {$user->getUsername()}.</p>");
                $post->setCreatedAt(new \DateTime('-'.rand(0, 30).' days'));
                $post->setAuthor($user);

                $manager->persist($post);
            }
        }

        $manager->flush();
    }
}
