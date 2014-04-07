package recfun
import common._

object Main {
  def main(args: Array[String]) {
    println("Pascal's Triangle")
    for (row <- 0 to 10) {
      for (col <- 0 to row)
        print(pascal(col, row) + " ")
      println()
    }
  }

  /**
   * Exercise 1
   */
  def pascal(c: Int, r: Int): Int = {
    if (c == 0 || c == r) 1 else {
      pascal(c - 1, r - 1) + pascal(c, r - 1)
    }
  }

  /**
   * Exercise 2
   */
  def balance(chars: List[Char]): Boolean = {
    def balanced(string: List[Char], pile: String): Boolean = {
      if (string.isEmpty) pile.isEmpty() else {
        def first = string.head;
        if (first == '(') balanced(string.tail, '(' + pile)
        else {
          if (first == ')') {
            !pile.isEmpty() && balanced(string.tail, pile.tail)
          } else {
            balanced(string.tail, pile)
          }
        }
      }
    }
    balanced(chars, "");
  }

  /**
   * Exercise 3
   */
  def countChange(money: Int, coins: List[Int]): Int = {
    def count(capacity: Int, changes: List[Int]): Int = {
      if (capacity == 0)
        1
      else if (capacity < 0)
        0
      else if (changes.isEmpty && capacity >= 1)
        0
      else
        count(capacity, changes.tail) + count(capacity - changes.head, changes)
    }
    count(money, coins.sorted)
  }
}
