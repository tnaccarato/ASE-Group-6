# -*- coding: utf-8 -*-
"""
Created on Tue Nov  7 19:12:32 2023

@author: kadam
"""

import time
import kanoodle
from kanoodle import *

# Define grid dimensions
GridWidth = 3
GridHeight = 4

# Define the pieces
Pieces = [
    # "I I \n"+
    # "III \n",
    #
    # "J   \n"+
    # "JJ  \n"+
    # "J   \n",

    " L  \n"+
    " L  \n"+
    " L  \n"
]

def main():
    start_time = time.time()

    # Initialize the board with 2 pieces
    # initial_board = [[' ' for _ in range(GridWidth)] for _ in range(GridHeight)]
    # Initialize the board with empty spaces
    initial_board = [[' ' for j in range(GridWidth)] for i in range(GridHeight)]
    initialize_board(initial_board)   # Convert the board to a string format
    board_description = ""
    for i in range(GridHeight):
        for j in range(GridWidth):
            board_description += initial_board[i][j]
        board_description += "\n"

    # Add the board description to the list of pieces
    modified_pieces = Pieces + [board_description]

    # Use the modified_pieces array to find solutions
    # This assumes the existence of a Kanoodle class with a findAllSolutions method, which is not provided.
    answer = Kanoodle.findAllSolutions(modified_pieces, GridWidth, GridHeight)
    end_time = time.time()

    if answer:
        print("Found answer:\n", answer)

def initialize_board(board):
    # Example: Place piece I at (0, 0) and piece I at (0, 2)
    # Initialize the board with empty spaces already handled in the main function
    print("This is board", board)

    board[0][0] = 'I'
    board[0][1] = 'I'
    board[1][0] = 'I'
    board[2][0] = 'I'
    board[2][1] = 'I'

    board[0][2] = 'J'
    board[1][1] = 'J'
    board[1][2] = 'J'
    board[2][2] = 'J'

if __name__ == "__main__":
    main()