Feature: Update and Review a Favorite Park List

  #search page
  Scenario: Navigate to Favorites page from Search page
    Given the user is on the Search page
    When the user clicks on "Favorites" in the nav bar
    Then the user should be navigated to the Favorites page

  Scenario: Navigate to Compare page from Search page
    Given the user is on the Search page
    When the user clicks on "Compare" in the nav bar
    Then the user should be navigated to the Compare page


  Scenario: User adds a park to their Favorites and sees success message
    Given the user is on the Search page
    And the search results for Alcatraz Island are displayed
    When the user hovers over the name of the park "Alcataraz Island"
    Then a plus sign should appear
    When the user clicks the plus sign
    Then a success message should be displayed

  Scenario: User tries to add a park that is already in their Favorites
    Given the user is on the Search page
    And "Alcatraz Island" is already in the user's favorites
    And the search results for Alcatraz Island are displayed
    When the user hovers over the name of the park "Alcataraz Island"
    Then a plus sign should appear
    When the user clicks the plus sign
    Then an error message should be displayed

  Scenario: User adds a park to their Favorites and sees it in Favorites list
    Given the user is on the Search page
    And the user has added "Alcatraz Island" to their favorites
    When the user navigates to the Favorites page
    Then the user should see "Alcatraz Island"

    #favorites page
  Scenario: Navigate to Search page from Favorites page
    Given the user is on the Favorites page
    When the user clicks on "Search" in the nav bar
    Then the user should be navigated to the Search page

  Scenario: Navigate to Compare page from Favorites page
    Given the user is on the Favorites page
    When the user clicks on "Compare" in the nav bar
    Then the user should be navigated to the Compare page

  Scenario: User deletes a single park from their Favorites
    Given the user is on the Favorites page
    And the user has "Alcatraz Island" in their favorites
    When the user hovers over the name of the park "Alcataraz Island"
    Then a minus sign should appear
    When the user clicks the minus sign
    Then a confirmation popup should be displayed
    When the user clicks "Confirm"
    Then "Alcatraz Island" should be removed from their Favorites list

  Scenario: User cancels delete a single park from their Favorites
    Given the user is on the Favorites page
    And the user has "Alcatraz Island" in their favorites
    When the user hovers over the name of the park "Alcataraz Island"
    Then a minus sign should appear
    When the user clicks the minus sign
    Then a confirmation popup should be displayed
    When the user clicks "Cancel"
    Then the confirmation popup should disappear
    And their Favorites list should remain the same

  Scenario: User deletes all parks from Favorites
    Given the user is on the Favorites page
    And the user has at least 2 parks in their Favorites
    When the user clicks the "Delete All" button
    Then a confirmation popup should be displayed
    When the user clicks "Confirm"
    Then all parks should be removed from their Favorites

  Scenario: User cancels delete all parks from Favorites
    Given the user is on the Favorites page
    And the user has at least 2 park in their Favorites
    When the user clicks the "Delete All" button
    Then a confirmation popup should be displayed
    When the user clicks "Cancel"
    Then the confirmation popup should disappear
    And their Favorites list should remain the same

  Scenario: User can view details of their Favorite parks
    Given the user is on the Favorites page
    And the user has at least one park in their Favorites
    When the user clicks on a favorite park
    Then the inline window of details should appear
    When the user clicks on that park again
    Then the inline window of details should disappear

  Scenario: Favorites looks the same as Search page
    Given the user is on the Favorites page
    And the user has at least one park in their Favorites
    Then their Favorites list should look the same as the Search results list