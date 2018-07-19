sleep 5
# A dummy script which takes one input to trigger the map chaining test
echo "This is some content... $(cat $dummyInput)" > ./toto.txt

iVal=$(cat $dummyInput)
val=$(( ( RANDOM % 10 )  + 1 ))

echo "{\"dummyOutput\": $iVal}"



