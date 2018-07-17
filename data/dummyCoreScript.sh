sleep 5

echo "This is some content... $(cat $dummyInput)" > ./toto.txt

iVal=$(cat $dummyInput)
val=$(( ( RANDOM % 10 )  + 1 ))

echo "{\"dummyOutput\": $iVal}"



