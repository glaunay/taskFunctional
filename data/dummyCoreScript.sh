sleep 5

echo "This is some content $(cat $dummyInput)" > ./toto.txt
val=$(( ( RANDOM % 10 )  + 1 ))

echo "{\"dummyOutput\": $val}"



