#(a) 
def st_create():
    students = []
    
    while True:
        last_name = input("Enter last name (up to 10 characters): ")
        first_name = input("Enter first name (up to 10 characters): ")
        while True:
            try:
                gpa = float(input("Enter GPA (0 to 100): "))
                if 0 <= gpa <= 100:
                    break
                else:
                    print("GPA must be between 0 and 100.")
            except ValueError:
                print("Invalid input. Please enter a number.")
        
        while True:
            try:
                student_id = int(input("Enter student ID (8-digit, e.g., 19376012): "))
                if len(str(student_id)) == 8:
                    break
                else:
                    print("Student ID must be 8 digits.")
            except ValueError:
                print("Invalid input. Please enter numbers only.")

        students.append((last_name[:10], first_name[:10], gpa, student_id))

        another = input("\nDo you want to add another student? (yes/no): ").lower()
        if another != "yes":
            break

    file_name = input("\nEnter the name of the text file: ")
    if not file_name.endswith('.txt'):
        file_name += '.txt'

    with open(file_name, "w") as file:
        for student in students:
            last_name, first_name, gpa, student_id = student
            file.write(f"{last_name}, {first_name}, {gpa:.2f}, {student_id}\n")

    print("\nStudent records have been saved to", file_name)


#(b)
def st_add():
    students = []
    student_ids = set()

    file_name = input("\nEnter the name of the student file: ")
    if not file_name.endswith('.txt'):
        file_name += '.txt'

    try:
        with open(file_name, "r") as file:
            for line in file:
                try:
                    parts = line.strip().split(", ")
                    if len(parts) == 4:
                        last_name, first_name, gpa, student_id = parts
                        student_id = int(student_id)
                        gpa = float(gpa)
                        if student_id not in student_ids:
                            student_ids.add(student_id)
                            students.append((last_name, first_name, gpa, student_id))
                except ValueError:
                    continue

    except FileNotFoundError:
        print("\nError: File not found. Please check:")
        print("- Is the file in the same folder as this program?")
        print("- Did you type the name correctly?")
        return

    print("\n\nStudent Records:\n")
    print("{:<14} {:<14} {:<8} {:<14}".format("Last Name", "First Name", "GPA", "Student ID"))
    print("=" * 50)
    for student in students:
        last_name, first_name, gpa, student_id = student
        print("{:<14} {:<14} {:<8.2f} {:<14}".format(last_name, first_name, gpa, student_id))


def main_menu():
    while True:
        print("\n===== Student Records System =====")
        print("1. Create New Student Records")
        print("2. Display Student Records")
        print("3. Exit")
        choice = input("\nEnter your choice (1-3): ")
        
        if choice == "1":
            st_create()
        elif choice == "2":
            st_add()
        elif choice == "3":
            print("\nExiting program. Goodbye!")
            break
        else:
            print("\nInvalid choice. Please enter 1, 2, or 3.")

if __name__ == "__main__":
    main_menu()
