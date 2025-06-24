import random

# Generate random list
numbers = [random.randint(1, 100) for _ in range(10)]
print("Original list:", numbers, "\n")

# Bubble sort
n = len(numbers)
for i in range(n):
    for j in range(0, n-i-1):
        if numbers[j] > numbers[j+1]:
            numbers[j], numbers[j+1] = numbers[j+1], numbers[j]

print("Sorted list:", numbers)
