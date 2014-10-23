package main
import(
  "fmt"
  "math"
  )
type Circle struct {
    x, y, r float64
}
func (c *Circle) area() float64 {
    return math.Pi * c.r*c.r
}
func hello() int{
  return 6
}
func main(){
  circle:=Circle{1,2,3}
  fmt.Println(circle.area())
  fmt.Println(hello())
}
