import time
import random

print("WELCOME TO THE DICE GAME")

def diceGAME():
    ROUND = 0
    print("\nGame is going to start..")

    time.sleep(2)
      
    dice1 = [1, 2, 3, 4, 5, 6]
    dice2 = [1, 2, 3, 4, 5, 6]
    
    player1score = 0
    player2score = 0

    ###player one starts here
    print("\nPlayer 1 press enter to roll dice: ")
    input()
    A = print(random.choice(dice1))
    B = print(random.choice(dice2))
    P1TOTAL = random.choice(dice1)+random.choice(dice2)
##+10 for even
    if P1TOTAL % 2 == 0:
        player1score = player1score + 10
    ##-5 if odd
    else:
        player1score = player1score - 5
    

            
    ###player two starts here
    print("\nPlayer 2 press enter to roll dice: ")
    input()
    C = print(random.choice(dice1))
    D = print(random.choice(dice2))
    P2TOTAL = random.choice(dice1)+random.choice(dice2)
##+10 for even
    if P2TOTAL % 2 == 0:
        player1score = player1score + 10
    ##-5 if odd
    else:
        player1score = player1score - 5

    ROUND = ROUND + 1

    while ROUND != '2':
        diceGAME()

diceGAME()
            
        
    
 


