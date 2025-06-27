import random
import time

print("\n\t==========================")
print("\t|   DICE GAME RULES      |")
print("\t==========================")
print("\nHOW TO PLAY:")
print("1. Two players take turns rolling two 6-sided dice each round")
print("2. The game consists of 3 rounds")
print("3. Scoring rules:")
print("   - If the sum of both dice is EVEN: +10 points")
print("   - If the sum of both dice is ODD: -5 points")
print("   - If you roll doubles (same number on both dice):")
print("     * You get an extra dice roll")
print("     * The number rolled is added to your score")
print("4. If scores are tied after 3 rounds, a sudden death")
print("   play-off occurs with single dice rolls until one")
print("   player rolls higher than the other")
print("5. Scores never go below 0 (negative scores become 0)")
print("6. The winner's name and score are saved to the hall of fame")
print("\n\t==========================")
print("\t|     GOOD LUCK!         |")
print("\t==========================\n")
time.sleep(2)


def DiceGAME():
    #AUTHENTICATION CODE

    print("Starting Game...\n")
    time.sleep(1)
    
    user1= input("Enter name 1: ")
    print("Authenticating user...")
    time.sleep(0.5)
    print("User authenticated")
    time.sleep(0.5)

    time.sleep(1)
        
    user2= input("\nEnter name 2: ")
    print("Authenticating user...")
    time.sleep(0.5)
    print("User authenticated")
    time.sleep(0.5)
    input("\nPress ENTER to start the game")
    
    time.sleep(1)

    ###############GAME CODE
    ROUND = 0 
    
    dice1 = [1, 2, 3, 4, 5, 6]
    dice2 = [1, 2, 3, 4, 5, 6]

    player1score = 0
    player2score = 0

    print("\n\t==========================")
    print("\t|WELCOME TO THE DICE GAME|")
    print("\t==========================")
    time.sleep(1)

    while ROUND <3:
        time.sleep(0.5)
        print("\n\n**********")
        print("ROUND: ", ROUND)
        time.sleep(0.5)
        ###########PLAYER 1 TURN
        print("*********************************")
        input("\nPlayer 1 press enter to roll dice: ")
        A = random.choice(dice1)
        B = random.choice(dice2)
        print(A)
        print(B)
        P1TOTAL = A + B
        print("ROUND TOTAL :", P1TOTAL)
        #POINTS
        # +10 for even
        if P1TOTAL % 2 == 0:
            player1score = player1score + 10
            #DOUBLE ROLL FOR PLAYER 1
            if A == B:
                print("***")
                input("\nEXTRA DICE ROLL P1: ")
                DRdiceP1 = random.choice(dice1)
                print(DRdiceP1)
                print("+", DRdiceP1, "points.")
                player1score = player1score + DRdiceP1
        ##-5 if odd
        else:
            player1score = player1score - 5
            if player1score < 0:
                player1score = 0


        ##########PLAYER 2 TURN
        input("\nPlayer 2 press enter to roll dice: ")
        C = random.choice(dice1)
        D = random.choice(dice2)
        print(C)
        print(D)
        P2TOTAL = C + D
        print("ROUND TOTAL :", P2TOTAL)
        #POINTS
        #+10 for even
        if P2TOTAL % 2 == 0:
            player2score = player2score + 10
            #DOUBLE ROLL FOR PLAYER 2
            if C == D:
                print("***")
                input("EXTRA DICE ROLL P2: ")
                DRdiceP2 = random.choice(dice1)
                print(DRdiceP2)
                print("\n+", DRdiceP2, "points.")
                player2score = player2score + DRdiceP2
        #-5 if odd
        else:
            player2score = player2score - 5
            if player2score < 0:
                player2score = 0
   
        #adds a round when new round starts
        ROUND = ROUND + 1

    #if both scores == to eachother
    while player1score == player2score:
        print("\nPLAY OFF")
        input("\nPlayer 1 press enter to roll dice: ")
        X = random.choice(dice1)
        print(X)
        
        input("\nPlayer 2 press enter to roll dice: ")
        Y = random.choice(dice1)
        print(Y)
        #prints out winner of end of the play off
        if X > Y:
            print("\nWINNER:", user1)
            DAN = str(player1score)
            file = open("winner.txt", "a")
            file.write(user1)
            file.write(" = ")
            file.write(DAN)
            file.write(" , ")
            file.close()
                
        elif Y >X:
            print("\nWINNER:", user2)
            BARRY = str(player2score)
            file = open("winner.txt", "a")
            file.write(user2)
            file.write(" = ")
            file.write(BARRY)
            file.write(" , ")
            file.close()

    #prints out winner of end of rounds
    print("\n",  user1, "SCORE:", player1score)
    print("\n",  user2, "SCORE:", player2score)

    #compare final scores and sees the winner
    if player1score > player2score:
        print("\nWINNER:", user1)
        HARRY = str(player1score)
        file = open("winner.txt", "a")
        file.write(user1)
        file.write(" = ")
        file.write(HARRY)
        file.write(" , ")
        file.close()

    elif player2score > player1score:
        print("\nWINNER:", user2)
        GEORGE = str(player2score)
        file = open("winner.txt", "a")
        file.write(user2)
        file.write(" = ")
        file.write(GEORGE)
        file.write(" , ")
        file.close()

    print("\n================")
    print("PREVIOUS WINNERS")
    print("================\n")
    BOB = open("winner.txt", "r")
    contents = BOB.read()
    print(contents)
    file.close
                
print("\n\n•••••••••••••••••••••••")
DiceGAME()
print("\n\n•••••••••••••••••••••••") 
DiceGAME()
print("\n\n•••••••••••••••••••••••") 
DiceGAME()
print("\n\n•••••••••••••••••••••••") 
