import sys
import json

def read_files(file1, file2, file3):
    # Read files
    with open(file1, "r") as f1, open(file2, "r") as f2, open(file3, "r") as f3:
        data1 = f1.read().strip()
        data2 = f2.read().strip()
        data3 = f3.read().strip()

    # Return as JSON string
    return json.dumps({"file1": data1, "file2": data2, "file3": data3})

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(json.dumps({"error": "Please provide exactly 3 file paths"}))
        sys.exit(1)

    file1, file2, file3 = sys.argv[1], sys.argv[2], sys.argv[3]
    output = read_files(file1, file2, file3)
    print(output)  # Output gets sent back to Express.js
