<?php

namespace App\Security;

use App\Entity\Post;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class PostVoter extends Voter
{
    public const EDIT = 'POST_EDIT';
    public const DELETE = 'POST_DELETE';

    protected function supports(string $attribute, $subject): bool
    {
        return in_array($attribute, [self::EDIT, self::DELETE])
            && $subject instanceof Post;
    }

    protected function voteOnAttribute(string $attribute, $post, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        // 🔑 Admin darf alles
        if (in_array('ROLE_ADMIN', $user->getRoles(), true)) {
            return true;
        }

        // ✍️ Autor darf seinen eigenen Post
        return $post->getAuthor() === $user;
    }
}
