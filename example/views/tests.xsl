<xsl:template name="tests">
   <h1>Tests</h1>
   
   <xsl:for-each select="//book">
      <h2><xsl:value-of select="title"/></h2>
      <xsl:value-of select="//author[id = current()/author_id]/name"/>
      <br/>
   </xsl:for-each>
   
   <xsl:for-each select="//author">
      <xsl:value-of select="name"/>
   </xsl:for-each>

   <br/><br/>

   <xsl:value-of select="//book[4]/category_id"/>
   <xsl:value-of select="//book[last()]"/>
   <xsl:value-of select="//*[category_id=1]"/>
   <xsl:value-of select="//*[category_id=3]/title"/>
   <xsl:value-of select="//book/isbn"/>
   <xsl:value-of select="//title/text()"/>
   <xsl:value-of select="//*[price > 15]"/>
   <xsl:value-of select="//*[contains(title, 'the')]"/>
   <xsl:value-of select="//book[position() &lt; 3]"/>

</xsl:template>