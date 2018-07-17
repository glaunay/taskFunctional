sleep 5

echo "This is some content... $iterValue" > ./toto.txt

iVal=$(cat $dummyInput)
val=$(( ( RANDOM % 10 )  + 1 ))

((iVal++))
echo "{\"dummyOutput_s2\": $iVal}"



