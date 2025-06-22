import time

def hangman():
    
    print("\n\nWelcome to HANGMAN")
    time.sleep(0)

    #instructionz
    print("You will now be asked to enter a word and will then have someone else guess it \nThey will have 5 chances to guess the word right \nbefore they lose!")
    time.sleep(0)

    #user enters word here
    word_to_guess = input("\nPlease enter your word: ").lower()
    print("\n" * 50) #screen clear

    guessed_word = ['_'] * len(word_to_guess) #changes string to underscores
    incorrect_guesses = []  # Track incorrect guesses separately
    guessCount = 5 #num of guesses

    while guessCount >0:

        print(" ".join(guessed_word) + "          " + " ".join(incorrect_guesses))
        letter = input("\n\nLetter guess: ").lower()

        if letter in guessed_word or letter in incorrect_guesses:
            print("You already guessed that letter! \n================================")
            
        elif letter in word_to_guess:
            #update the guessed_word list with the correct letter
            for i in range(len(word_to_guess)):
                if word_to_guess[i] == letter:
                    guessed_word[i] = letter
            
        else:
            incorrect_guesses.append(letter)  # Add to incorrect guesses
            guessCount -= 1
            print(f"Incorrect! You have ", guessCount, " guesses left. \n=====================================")
            print(f"\n")

        # Check if word is complete      
        if "_" not in guessed_word:
            print(" ".join(guessed_word) + "          " + " ".join(incorrect_guesses))
            print("Congratulations! You have successfully guessed the word!")
            return
    
    print(f"You have failed. The original word was: ", word_to_guess)

hangman()
hangman()
